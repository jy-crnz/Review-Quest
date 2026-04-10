import { QuizQuestionSchema, type QuizQuestion, LevelSchema, DungeonDataSchema, type DungeonData } from '@/lib/schemas';
import { QuizType } from '@/features/game/store';
import OpenAI from "openai";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';

/**
 * Service Layer: OpenRouter Intelligence Integration
 * Engineering Standard: Use rigid sanitization to handle AI JSON hallucinations.
 */
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || "",
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "ReviewQuest",
    }
});

const AIResponseSchema = DungeonDataSchema;

export type GeneratedBattle = z.infer<typeof AIResponseSchema>;

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
        'multiple-choice': "Generate 5 challenging Multiple Choice questions per level. Provide exactly 4 options per question. Randomize the position of the correct answer (correctIdx should not always be 0).",
        'true-false': "Generate 5 True/False questions per level. The 'options' array must be strictly ['True', 'False', '', '']. Use index 0 for True and 1 for False. DO NOT move the correct answer to the first position; the 'options' array must stay in this exact order.",
        'enumeration': "Generate 5 Identification/Term questions per level. Provide the exact correct term as one option and 3 plausible but incorrect distractors. Randomize the position of the correct answer (correctIdx should not always be 0)."
    };

    try {
        const prompt = `
            You are the "Master of Intel" in a gamified learning RPG. 
            Transform the provided study material into a Dungeon Level Structure based on uploaded files.
            
            CHALLENGE MODE: ${quizType.toUpperCase()}
            
            TASK: 
            1. Analyze the content and split it into distinct Sub-Topics. Each sub-topic will represent one Level (Floor) of the dungeon. Generate at least 2 levels and up to 4 levels.
            2. The main subject of the file will be the "title" of the Dungeon.
            3. For each Level, provide:
               - "id": A unique string identifier.
               - "topicName": The name of the sub-topic (e.g., 'Introduction to Anatomy').
               - "enemyId": Choose one of the following enemy sprite identifiers: 'vanguard_scout', 'elite_sentinel', 'academic_overlord', 'chaos_guard'. Vary the sprite per level if possible.
               - "questions": An array of questions for this level.
            4. ${typeInstructions[quizType as keyof typeof typeInstructions]} All questions in all levels MUST follow this challenge mode.
            
            STRICT JSON SCHEMA:
            {
              "title": "string",
              "levels": [
                {
                  "id": "string",
                  "topicName": "string",
                  "enemyId": "string",
                  "questions": [
                    {
                      "q": "string",
                      "options": ["string", "string", "string", "string"],
                      "correctIdx": number,
                      "explanation": "string"
                    }
                  ]
                }
              ]
            }

            CONTEXT MATERIAL:
            ${fileText.substring(0, 10000)}
        `;

        const response = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001",
            messages: [
                { role: "system", content: "You are a JSON-only tactical engine. You never include trailing commas, you always close arrays/objects correctly, and you strictly follow the 4-option array requirement." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const responseText = response.choices[0].message.content;
        if (!responseText) throw new Error("EMPTY_BOSS_RESPONSE");

        // 🛡️ REPAIR LOGIC: Remove Markdown and find valid JSON boundaries
        let cleanJson = responseText.replace(/```json|```/g, "").trim();

        // 🛡️ THE TRAILING COMMA KILLER
        cleanJson = cleanJson.replace(/,[ \t\r\n]*([\]}])/g, '$1');

        const rawData = JSON.parse(cleanJson);

        // Normalization Layer
        let dataToValidate = {
            title: rawData.title || "General Intel",
            levels: (rawData.levels || []).map((level: any) => ({
                id: level.id || uuidv4(),
                topicName: level.topicName || "Unknown Sector",
                enemyId: level.enemyId || 'vanguard_scout',
                questions: (level.questions || []).map((q: any) => {
                    let options = Array.isArray(q.options)
                        ? [...q.options, "", "", "", ""].slice(0, 4)
                        : ["", "", "", ""];
                    
                    let correctIdx = q.correctIdx;

                    if (quizType === 'true-false') {
                        const aiCorrectOption = String(options[correctIdx] || '').toLowerCase();
                        const isTrue = aiCorrectOption.includes('true') || (correctIdx === 0 && !aiCorrectOption.includes('false'));
                        options = ['True', 'False', '', ''];
                        correctIdx = isTrue ? 0 : 1;
                    }

                    return {
                        ...q,
                        options,
                        correctIdx
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
        throw new Error("The Academic Boss jammed your communications with malformed data. Recalibrating sensors...");
    }
};