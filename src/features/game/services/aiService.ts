import { QuizQuestionSchema, type QuizQuestion, LevelSchema, DungeonDataSchema, type DungeonData } from '@/lib/schemas';
import { QuizType } from '@/features/game/store';
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { executeMultiAiCompletion } from '@/lib/multiAiClient';



const AIResponseSchema = DungeonDataSchema;

export type GeneratedBattle = z.infer<typeof AIResponseSchema>;

function shuffleOptions(options: string[], correctIdx: number): { options: string[]; correctIdx: number } {
    if (correctIdx < 0 || correctIdx >= options.length) correctIdx = 0;
    const correctAnswer = options[correctIdx];
    const validOptions = options.filter(opt => opt && opt.trim() !== "");
    if (validOptions.length <= 1) return { options: [...options, "", "", "", ""].slice(0, 4), correctIdx: 0 };
    const shuffled = [...validOptions];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    while (shuffled.length < 4) shuffled.push("");
    const newCorrectIdx = shuffled.indexOf(correctAnswer);
    return {
        options: shuffled.slice(0, 4),
        correctIdx: newCorrectIdx !== -1 ? newCorrectIdx : 0
    };
}

/**
 * Logic Layer: Intelligence Gathering
 * Feature: Generates procedural battles based on Campaign Quiz Type.
 * Fix: Aggressive JSON cleanup to prevent 'Unexpected token' crashes.
 */
export const generateBossBattle = async (
    fileText: string,
    quizType: QuizType = 'multiple-choice'
): Promise<GeneratedBattle> => {
    if (!fileText || fileText.length < 50) {
        throw new Error("Insufficient intel. Please provide more detailed study material.");
    }

    // TACTICAL INSTRUCTION MAPPING
    const typeInstructions = {
        'multiple-choice': "Generate 3 to 4 challenging Multiple Choice questions per level. Provide exactly 4 options per question. Randomize the position of the correct answer (correctIdx should not always be 0). Keep explanation under 25 words.",
        'true-false': "Generate 3 to 4 True/False questions per level. The 'options' array must be strictly ['True', 'False', '', '']. Use index 0 for True and 1 for False. DO NOT move the correct answer to the first position; the 'options' array must stay in this exact order. Keep explanation under 25 words.",
        'enumeration': "Generate 3 to 4 Identification/Term questions per level. Provide the exact correct term as one option and 3 plausible but incorrect distractors. Randomize the position of the correct answer (correctIdx should not always be 0). Keep explanation under 25 words."
    };

    try {
        const prompt = `
            You are the "Master of Intel" in a gamified learning RPG. 
            Analyze the provided study material and extract an exhaustive Dungeon Level Structure so the student can study all topics and conquer all questions.
            
            CHALLENGE MODE: ${quizType.toUpperCase()}
            
            TASK: 
            1. Analyze the content and split it into 3 to 5 distinct Sub-Topics covering the material thoroughly. Each sub-topic will represent one Level (Floor) of the dungeon.
            2. The main subject of the file will be the "title" of the Dungeon.
            3. Provide a concise executive "summary" (2 sentences) describing what this material teaches.
            4. For each Level, provide:
               - "id": A unique string identifier.
               - "topicName": The name of the sub-topic.
               - "enemyId": One of: 'vanguard_scout', 'elite_sentinel', 'academic_overlord', 'chaos_guard'.
               - "summary": A 1-sentence overview of what this topic covers.
               - "keyConcepts": An array of 3 concise bullet points of key definitions, core rules, or formulas (1 short sentence each).
               - "questions": An array of 3-4 challenging questions for this level covering the key concepts.
            5. ${typeInstructions[quizType as keyof typeof typeInstructions]}
            6. IMPORTANT: Keep all explanations and concepts concise to ensure the entire JSON response completes cleanly without truncation.
            
            STRICT JSON SCHEMA:
            {
              "title": "string",
              "summary": "string",
              "levels": [
                {
                  "id": "string",
                  "topicName": "string",
                  "enemyId": "string",
                  "summary": "string",
                  "keyConcepts": ["string", "string", "string"],
                  "questions": [
                    {
                      "q": "string",
                      "options": ["string", "string", "string", "string"],
                      "correctIdx": number,
                      "explanation": "string",
                      "hint": "string"
                    }
                  ]
                }
              ]
            }

            CONTEXT MATERIAL:
            ${fileText.substring(0, 60000)}
        `;

        const aiResult = await executeMultiAiCompletion({
            prompt,
            systemPrompt: "You are a JSON-only tactical engine. You never include trailing commas, you always close arrays/objects correctly, and you strictly follow the 4-option array requirement.",
            maxTokens: 5000,
            priority: 'gemini'
        });

        const responseText = aiResult.content;
        if (!responseText) throw new Error("EMPTY_BOSS_RESPONSE");

        // 🛡️ REPAIR LOGIC: Resilient JSON Parser with Truncation Recovery
        let cleanJson = responseText.replace(/```json|```/g, "").trim();
        cleanJson = cleanJson.replace(/,[ \t\r\n]*([\]}])/g, '$1');

        let rawData: any;
        try {
            rawData = JSON.parse(cleanJson);
        } catch (initialParseError) {
            console.warn("Initial JSON parse failed. Attempting structural recovery...");
            const lastObjEnd = cleanJson.lastIndexOf('}');
            if (lastObjEnd !== -1) {
                let candidate = cleanJson.substring(0, lastObjEnd + 1);
                let openBrackets = 0;
                let openBraces = 0;
                let inString = false;
                let escaped = false;

                for (let i = 0; i < candidate.length; i++) {
                    const char = candidate[i];
                    if (escaped) { escaped = false; continue; }
                    if (char === '\\') { escaped = true; continue; }
                    if (char === '"') { inString = !inString; continue; }
                    if (!inString) {
                        if (char === '[') openBrackets++;
                        else if (char === ']') openBrackets--;
                        else if (char === '{') openBraces++;
                        else if (char === '}') openBraces--;
                    }
                }

                candidate = candidate.replace(/,\s*$/, '');
                while (openBrackets > 0) { candidate += ']'; openBrackets--; }
                while (openBraces > 0) { candidate += '}'; openBraces--; }

                try {
                    rawData = JSON.parse(candidate);
                } catch {
                    throw initialParseError;
                }
            } else {
                throw initialParseError;
            }
        }

        // Normalization Layer
        const dataToValidate = {
            title: rawData.title || "General Intel",
            summary: rawData.summary || "Comprehensive tactical study material.",
            levels: (rawData.levels || []).map((level: any) => ({
                id: level.id || uuidv4(),
                topicName: level.topicName || "Unknown Sector",
                enemyId: level.enemyId || 'vanguard_scout',
                summary: level.summary || "",
                keyConcepts: Array.isArray(level.keyConcepts) ? level.keyConcepts.map(String) : [],
                questions: (level.questions || []).map((q: any) => {
                    let options = Array.isArray(q.options)
                        ? [...q.options, "", "", "", ""].slice(0, 4)
                        : ["", "", "", ""];
                    
                    let correctIdx = typeof q.correctIdx === 'number' ? q.correctIdx : 0;

                    if (quizType === 'true-false') {
                        const aiCorrectOption = String(options[correctIdx] || '').toLowerCase();
                        const isTrue = aiCorrectOption.includes('true') || (correctIdx === 0 && !aiCorrectOption.includes('false'));
                        options = ['True', 'False', '', ''];
                        correctIdx = isTrue ? 0 : 1;
                    } else {
                        const shuffled = shuffleOptions(options, correctIdx);
                        options = shuffled.options;
                        correctIdx = shuffled.correctIdx;
                    }

                    return {
                        ...q,
                        options,
                        correctIdx,
                        hint: q.hint ? String(q.hint).trim() : undefined
                    };
                }).filter((q: any) => q.q && q.q.length > 2)
            })).filter((level: any) => level.questions.length > 0)
        };

        if (dataToValidate.levels.length === 0) {
            throw new Error("The AI failed to generate valid combat data for this sector.");
        }

        // Final Boundary Validation (Zod)
        return AIResponseSchema.parse(dataToValidate);

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            console.error("ZOD_VALIDATION_ISSUES:", error.issues);
            throw new Error("The Boss's logic didn't match the game rules. Re-uploading usually fixes this.");
        }

        console.error("AI_CORE_FAILURE:", error.message);
        throw new Error(error.message ? `AI Core Error: ${error.message}` : "The Academic Boss jammed your communications with malformed data. Recalibrating sensors...");
    }
};