import { z } from "zod";
import { QuizSchema, QuizQuestion } from "@/lib/schemas";
import { QuizType } from "@/features/game/store"; // Ensure this import path is correct
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";

/**
 * AI Service Configuration
 * Standard: OpenRouter integration with Gemini 2.0 Flash for speed and accuracy.
 */
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || "",
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "ReviewQuest",
    }
});

/**
 * AI Engine: Intelligence Gathering
 * Architecture: Parameterized generation based on Dungeon Quiz Type.
 */
export const generateQuizFromContent = async (
    rawContent: string,
    materialId: string,
    quizType: QuizType = 'multiple-choice' // NEW: Challenge-aware parameter
): Promise<z.infer<typeof QuizSchema>> => {

    // 1. Guard Clause: Validation Boundary
    if (!rawContent || rawContent.length < 50) {
        throw new Error("Insufficient intel. Material is too sparse for extraction.");
    }

    // 2. Tactical Instruction Mapping
    const challengeInstructions = {
        'multiple-choice': "Generate 15 challenging multiple-choice questions. Each must have 4 distinct options.",
        'true-false': "Generate 15 True/False questions. The 'options' array must be strictly ['True', 'False'].",
        'enumeration': "Generate 15 identification questions. The correct answer must be a specific term or phrase from the text. Provide 3 incorrect distractors as well."
    };

    try {
        const prompt = `
            You are the "Master of Intel" in a gamified learning RPG. 
            Target Challenge Mode: ${quizType.toUpperCase()}

            TASK:
            1. Analyze the Context Material provided.
            2. Identify the core Subject (e.g., "IT", "Nursing", "Law").
            3. Create a creative Boss Name and an intimidating Encounter Taunt.
            4. ${challengeInstructions[quizType]}

            STRICT JSON SCHEMA:
            {
              "subject": "string",
              "bossName": "string",
              "bossQuote": "string",
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
            ${rawContent.substring(0, 12000)}
        `;

        // 3. Logic Layer: AI Transmission
        const response = await openai.chat.completions.create({
            model: process.env.AI_MODEL || "google/gemini-2.5-flash-lite",
            max_tokens: 2000,
            messages: [
                { role: "system", content: "You are a JSON-only tactical engine. You adapt study materials into RPG combat encounters." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const responseText = response.choices[0].message.content;
        if (!responseText) throw new Error("EMPTY_DATA_STREAM");

        // 4. Sanitization & Normalization
        const rawData = JSON.parse(responseText.replace(/```json|```/g, "").trim());

        // Ensure questions are valid and handle True/False padding for schema compliance
        let normalizedQuestions = (rawData.questions || []).map((q: any) => {
            let options = q.options;

            // 🛡️ Schema Repair: If T/F, ensure 4 slots exist to satisfy standard Zod schema
            if (quizType === 'true-false' && options.length === 2) {
                options = [options[0], options[1], "", ""];
            }

            return {
                ...q,
                options: options.slice(0, 4) // Ensure exactly 4
            };
        });

        // 5. Final Validation: Architecture is kindness to my future self
        const validatedQuiz = QuizSchema.parse({
            id: uuidv4(),
            reviewerId: materialId,
            subject: rawData.subject || "General Intel",
            bossName: rawData.bossName || "The Academic Adversary",
            bossQuote: rawData.bossQuote || "Prepare for evaluation.",
            questions: normalizedQuestions,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return validatedQuiz;

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("DATA_MISMATCH:", error.issues);
            throw new Error("The AI generated an invalid combat structure.");
        }
        console.error("AI_GEN_CRASH:", error);
        throw new Error("The Academic Boss jammed the data extraction process.");
    }
};