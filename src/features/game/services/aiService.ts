import { QuizQuestionSchema, type QuizQuestion } from '@/lib/schemas';
import { QuizType } from '@/features/game/store';
import OpenAI from "openai";
import { z } from "zod";

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

const AIResponseSchema = z.object({
    subject: z.string(),
    bossName: z.string(),
    bossQuote: z.string(),
    missionBriefing: z.string(),
    afterActionReport: z.object({
        victory: z.string(),
        defeat: z.string()
    }),
    questions: z.array(z.object({
        q: z.string(),
        options: z.array(z.string()),
        correctIdx: z.number(),
        explanation: z.string()
    }))
});

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
        'multiple-choice': "Generate 15 challenging Multiple Choice questions. Provide exactly 4 options per question. Randomize the position of the correct answer (correctIdx should not always be 0).",
        'true-false': "Generate 15 True/False questions. The 'options' array must be strictly ['True', 'False', '', '']. Use index 0 for True and 1 for False. DO NOT move the correct answer to the first position; the 'options' array must stay in this exact order.",
        'enumeration': "Generate 15 Identification/Term questions. Provide the exact correct term as one option and 3 plausible but incorrect distractors. Randomize the position of the correct answer (correctIdx should not always be 0)."
    };

    try {
        const prompt = `
            You are the "Master of Intel" in a gamified learning RPG. 
            Transform the provided study material into a legendary Boss Battle.
            
            CHALLENGE MODE: ${quizType.toUpperCase()}
            
            TASK: 
            1. Identify the academic subject.
            2. Create a creative Boss Name based on the subject.
            3. Write a short, intimidating "Encounter Taunt".
            4. Write a "missionBriefing" (2-3 sentences): A sci-fi hook explaining why the player must defeat this boss to secure the data.
            5. Write an "afterActionReport" with "victory" and "defeat" strings: Flavor text for the end of the mission.
            6. ${typeInstructions[quizType]} 
            
            STRICT JSON SCHEMA:
            {
              "subject": "string",
              "bossName": "string",
              "bossQuote": "string",
              "missionBriefing": "string",
              "afterActionReport": {
                "victory": "string",
                "defeat": "string"
              },
              "questions": [
                {
                  "q": "string",
                  "options": ["string", "string", "string", "string"],
                  "correctIdx": number,
                  "explanation": "string"
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

        // 🛡️ THE TRAILING COMMA KILLER: This regex removes commas followed by a closing bracket or brace
        // This prevents the "Unexpected token ']'" error common in AI-generated JSON.
        cleanJson = cleanJson.replace(/,[ \t\r\n]*([\]}])/g, '$1');

        const rawData = JSON.parse(cleanJson);

        // Normalization Layer: Ensure all fields exist and options are padded for schema compliance
        let dataToValidate = {
            subject: rawData.subject || "General Intel",
            bossName: rawData.bossName || "The Adversary",
            bossQuote: rawData.bossQuote || "Prepare for evaluation.",
            missionBriefing: rawData.missionBriefing || "Intel reveals a critical sector compromise. Your objective is to de-encrypt the target's logic gates.",
            afterActionReport: {
                victory: rawData.afterActionReport?.victory || "Sector secured. Intelligence successfully integrated.",
                defeat: rawData.afterActionReport?.defeat || "Mission failed. Tactical retreat necessary."
            },
            questions: (rawData.questions || []).map((q: any) => ({
                ...q,
                // Hard-fix for option array lengths (Ensures exactly 4 strings for Zod)
                options: Array.isArray(q.options)
                    ? [...q.options, "", "", "", ""].slice(0, 4)
                    : ["", "", "", ""]
            }))
        };

        // 🛡️ TRUE/FALSE HARD-FIX: Prevents the "switched answer" bug
        if (quizType === 'true-false') {
            dataToValidate.questions = dataToValidate.questions.map((q: any) => {
                // Determine the AI's intended answer by checking the text of the selected option
                const aiCorrectOption = String(q.options[q.correctIdx] || '').toLowerCase();
                const isTrue = aiCorrectOption.includes('true') || (q.correctIdx === 0 && !aiCorrectOption.includes('false'));
                
                return {
                    ...q,
                    options: ['True', 'False', '', ''],
                    correctIdx: isTrue ? 0 : 1
                };
            });
        }

        // Filter out any questions that are completely missing text
        dataToValidate.questions = dataToValidate.questions.filter((q: any) => q.q && q.q.length > 2);

        if (dataToValidate.questions.length === 0) {
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