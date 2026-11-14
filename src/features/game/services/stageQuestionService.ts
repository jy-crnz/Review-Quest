import { type ReviewerStage, QuizQuestionSchema, type QuizQuestion } from "@/lib/schemas";
import { type QuizType } from "@/features/game/store";
import { executeMultiAiCompletion } from "@/lib/multiAiClient";
import { z } from "zod";

const QuestionsResponseSchema = z.object({
    questions: z.array(QuizQuestionSchema)
});


/**
 * Service: Just-In-Time (JIT) Stage Question Generator
 * Generates battle questions strictly for ONE stage's items.
 * Uses micro-tokens (~250-400 tokens) with near-instant execution.
 */

// ---------------------------------------------------------------------------
// 🔒 TIER-2: Zero-AI Deterministic Question Builder
// ---------------------------------------------------------------------------
function buildDeterministicQuestions(stage: ReviewerStage, quizType: QuizType): QuizQuestion[] {
    const allItems = stage.items ?? [];
    const targetCount = Math.max(5, Math.min(10, allItems.length));

    // Fisher-Yates shuffle (in-place, returns array)
    function shuffle<T>(arr: T[]): T[] {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Helper: first two words of a string + "..."
    function firstTwoWords(str: string): string {
        return str.split(/\s+/).slice(0, 2).join(' ') + '...';
    }

    // Helper: pick 3 distractor terms from other items, padded if needed
    function pickDistractors(currentTerm: string): string[] {
        const pool = allItems.map(it => it.term).filter(t => t !== currentTerm);
        shuffle(pool);
        const chosen = pool.slice(0, 3);
        while (chosen.length < 3) {
            chosen.push(`Ibang Opsyon ${chosen.length + 1}`);
        }
        return chosen;
    }

    const questions: QuizQuestion[] = [];

    if (quizType === 'multiple-choice') {
        for (let i = 0; i < targetCount; i++) {
            const item = allItems[i % allItems.length];
            const correctAnswer = item.term;
            const distractors = pickDistractors(correctAnswer);

            // Choose question phrasing: alternate between two styles
            const q = i % 2 === 0
                ? `Ano ang ${item.term}?`
                : `Alin ang tumutukoy sa: ${item.description}?`;

            const allFour = shuffle([correctAnswer, ...distractors]);
            const correctIdx = allFour.indexOf(correctAnswer);

            questions.push({
                q,
                options: allFour,
                correctIdx: correctIdx !== -1 ? correctIdx : 0,
                explanation: item.description,
                hint: firstTwoWords(item.description),
            });
        }
    } else if (quizType === 'true-false') {
        for (let i = 0; i < targetCount; i++) {
            const item = allItems[i % allItems.length];
            let statement: string;
            let correctIdx: number;

            if (i % 2 === 0) {
                // Even-indexed → true statement
                statement = `${item.term} — ${item.description}`;
                correctIdx = 0; // 'True'
            } else {
                // Odd-indexed → false statement (swap with next item's description)
                const nextItem = allItems[(i + 1) % allItems.length];
                statement = `${item.term} — ${nextItem.description}`;
                correctIdx = 1; // 'False'
            }

            questions.push({
                q: `Totoo o Mali: ${statement}`,
                options: ['True', 'False', '', ''],
                correctIdx,
                explanation: `Ang tamang sagot ay: ${item.term} — ${item.description}`,
            });
        }
    } else {
        // 'enumeration'
        for (let i = 0; i < targetCount; i++) {
            const item = allItems[i % allItems.length];
            const correctAnswer = item.term;
            const distractors = pickDistractors(correctAnswer);

            // Build deduplicated acceptedAnswers
            const termWords = item.term.split(/\s+/);
            const accepted = Array.from(new Set([
                item.term,
                termWords.slice(0, 2).join(' '),
                termWords[0] ?? item.term,
            ])).filter(Boolean);

            const allFour = shuffle([correctAnswer, ...distractors]);
            const correctIdx = allFour.indexOf(correctAnswer);

            questions.push({
                q: `Ano ang tawag sa: ${item.description}?`,
                options: allFour,
                correctIdx: correctIdx !== -1 ? correctIdx : 0,
                explanation: item.description,
                acceptedAnswers: accepted,
            });
        }
    }

    return questions;
}
// ---------------------------------------------------------------------------

export async function generateStageQuestions(
    stage: ReviewerStage,
    quizType: QuizType = 'multiple-choice'
): Promise<QuizQuestion[]> {
    if (!stage.items || stage.items.length === 0) {
        throw new Error("No study items in this stage.");
    }

    // 🛡️ BATTLE SIZING: Cap at 10 items per battle to ensure fast (<5s) generation and prevent token cutoffs
    const targetItems = stage.items.slice(0, 10);
    const targetQuestionCount = Math.max(5, Math.min(10, targetItems.length));

    const typeInstructions = {
        'multiple-choice': "For each item, generate a multiple-choice question with 'correctAnswer' (the EXACT correct term/answer string based on the study item) and 'distractors' (an array of exactly 3 distinct, plausible, but incorrect options).",
        'true-false': "For each item, generate a True/False statement with 'correctAnswer' (strictly 'True' or 'False') and 'distractors' ([] empty array).",
        'enumeration': "For each item, generate an identification recall question with 'correctAnswer' (the primary correct term), 'acceptedAnswers' (an array of 2 to 4 accepted variations, aliases, abbreviations, or nicknames students might enter, e.g. for 'Maestro Justiniano Aquino Cruz' -> ['Justiniano Cruz', 'Justiniano Aquino Cruz', 'Justiniano']), and 'distractors' (an array of 3 plausible distractor terms)."
    };

    const prompt = `
        You are the "Battle Architect" in a gamified learning RPG.
        Generate combat challenge questions strictly based on the provided study items for the sector: "${stage.title}".
        
        CHALLENGE MODE: ${quizType.toUpperCase()}
        
        INSTRUCTIONS:
        1. Generate questions testing the concepts, people, dates, or terms in this stage.
        2. Generate exactly ${targetQuestionCount} questions. You MUST generate questions thoroughly testing the items listed under STAGE STUDY ITEMS below. If there are fewer than ${targetQuestionCount} items, create multiple distinct questions examining different aspects, dates, roles, or true/false nuances of the items so every question is unique.
        3. ${typeInstructions[quizType]}
        4. Keep questions, explanations, and hints concise (under 20 words) for compact, reliable JSON output.
        5. Provide a helpful 'hint' for each question: a subtle clue, mnemonic, or context clue to guide a student who is clueless without stating the answer directly.
        6. CRITICAL: Maintain the exact language of the items (e.g., Filipino/Tagalog if the items are in Tagalog, English if in English).
        7. FACTUAL FAITHFULNESS: Each question must directly test the exact fact or event described. If the item describes a birthdate / kapanganakan, ask when or where they were born (e.g. "Kailan ipinanganak si Jose Rizal?"). Do not alter the nature of the event or hallucinate unrelated actions.
        
        STAGE STUDY ITEMS:
        ${JSON.stringify(targetItems, null, 2)}
        
        STRICT JSON SCHEMA:
        {
          "questions": [
            {
              "q": "string",
              "correctAnswer": "string",
              "acceptedAnswers": ["string"],
              "distractors": ["string", "string", "string"],
              "explanation": "string",
              "hint": "string"
            }
          ]
        }
    `;

    // Compact token budget (2500-4500 tokens) ensuring fast execution without truncating
    const dynamicMaxTokens = Math.min(5000, Math.max(2500, targetQuestionCount * 350));

    let normalizedQuestions: any[] = [];

    try {
        const aiResult = await executeMultiAiCompletion({
            prompt,
            systemPrompt: "You are a JSON-only combat generator. You strictly output valid JSON.",
            maxTokens: dynamicMaxTokens,
            priority: 'gemini'
        });

        const responseText = aiResult.content;
        if (!responseText) throw new Error("EMPTY_STAGE_QUESTIONS");

        let cleanJson = responseText.replace(/```json|```/g, "").trim();
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }
        cleanJson = cleanJson.replace(/,[ \t\r\n]*([\]}])/g, '$1');

        // 🛡️ BULLETPROOF REPAIR: Parse questions with backtrack recovery to prevent "Unterminated string" crashes
        let rawQuestions: any[] = [];
        try {
            const parsed = JSON.parse(cleanJson);
            rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : Array.isArray(parsed) ? parsed : [];
        } catch {
            // Backtrack recovery: find last completed question object closure `}`
            const lastBrace = cleanJson.lastIndexOf('}');
            if (lastBrace !== -1) {
                let candidate = cleanJson.substring(0, lastBrace + 1).replace(/,\s*$/, '');
                if (!candidate.trim().endsWith(']}')) {
                    candidate += ']}';
                }
                try {
                    const parsed = JSON.parse(candidate);
                    rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
                } catch {
                    // Try array slice
                    const firstBracket = cleanJson.indexOf('[');
                    if (firstBracket !== -1 && lastBrace > firstBracket) {
                        try {
                            const arrayCandidate = cleanJson.substring(firstBracket, lastBrace + 1) + ']';
                            const parsed = JSON.parse(arrayCandidate);
                            if (Array.isArray(parsed)) rawQuestions = parsed;
                        } catch {
                            // Regex fallback below
                        }
                    }
                }
            }

            // Regex fallback: extract any fully formed question objects
            if (rawQuestions.length === 0) {
                const qRegex = /\{\s*"q"\s*:\s*"([^"]+)"\s*,\s*"options"\s*:\s*\[([^\]]+)\]\s*,\s*"correctIdx"\s*:\s*(\d+)(?:,\s*"explanation"\s*:\s*"([^"]*)")?\s*\}/g;
                let m;
                while ((m = qRegex.exec(cleanJson)) !== null) {
                    try {
                        const rawOpts = m[2].split(',').map((s: string) => s.trim().replace(/^"|"$/g, ''));
                        rawQuestions.push({
                            q: m[1],
                            options: rawOpts,
                            correctIdx: parseInt(m[3], 10),
                            explanation: m[4] || ""
                        });
                    } catch {
                        // ignore
                    }
                }
            }
        }

        // Normalization & Zod validation
        normalizedQuestions = rawQuestions.map((q: any) => {
            const questionText = String(q.q || q.question || q.prompt || "").trim();
            let correctAnswer = String(q.correctAnswer || q.answer || q.correct || q.correct_answer || "").trim();
            let distractors = Array.isArray(q.distractors)
                ? q.distractors.map((d: any) => String(d || "").trim()).filter(Boolean)
                : Array.isArray(q.incorrect_answers)
                ? q.incorrect_answers.map((d: any) => String(d || "").trim()).filter(Boolean)
                : [];

            const explanation = String(q.explanation || q.rationale || "").trim();
            const hint = q.hint || q.clue ? String(q.hint || q.clue).trim() : undefined;

            if (quizType === 'true-false') {
                const isTrue = correctAnswer.toLowerCase().includes('true') ||
                    (typeof q.correctIdx === 'number' && q.correctIdx === 0 && !correctAnswer.toLowerCase().includes('false'));
                return {
                    q: questionText,
                    options: ['True', 'False', '', ''],
                    correctIdx: isTrue ? 0 : 1,
                    explanation,
                    hint
                };
            }

            // Support backward-compatibility if AI returned options array without correctAnswer
            if (!correctAnswer && Array.isArray(q.options) && q.options.length > 0) {
                const rawIdx = typeof q.correctIdx === 'number' && q.correctIdx >= 0 && q.correctIdx < q.options.length ? q.correctIdx : 0;
                correctAnswer = String(q.options[rawIdx] || "").trim();
                distractors = q.options.filter((_: any, i: number) => i !== rawIdx).map((o: any) => String(o || "").trim()).filter(Boolean);
            }

            if (!correctAnswer) {
                correctAnswer = "Wastong Sagot";
            }

            // Filter out any distractor that duplicates the correct answer
            let uniqueDistractors: string[] = distractors.filter((d: string) => d.toLowerCase() !== correctAnswer.toLowerCase());
            while (uniqueDistractors.length < 3) {
                uniqueDistractors.push(`Ibang Opsyon ${uniqueDistractors.length + 1}`);
            }
            uniqueDistractors = uniqueDistractors.slice(0, 3);

            // Combine into 4 options
            const allFour = [correctAnswer, ...uniqueDistractors];

            // 🎲 Programmatic Fisher-Yates shuffle
            for (let i = allFour.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allFour[i], allFour[j]] = [allFour[j], allFour[i]];
            }

            // Deterministic correctIdx: GUARANTEED to match correctAnswer
            const finalCorrectIdx = allFour.indexOf(correctAnswer);

            const acceptedList = Array.isArray(q.acceptedAnswers)
                ? q.acceptedAnswers.map((a: any) => String(a || "").trim()).filter(Boolean)
                : Array.isArray(q.accepted)
                ? q.accepted.map((a: any) => String(a || "").trim()).filter(Boolean)
                : [];

            return {
                q: questionText,
                options: allFour,
                correctIdx: finalCorrectIdx !== -1 ? finalCorrectIdx : 0,
                explanation,
                acceptedAnswers: Array.from(new Set([correctAnswer, ...acceptedList])),
                hint
            };
        }).filter((q: any) => q.q && q.q.length > 2);

        if (normalizedQuestions.length === 0) {
            // TIER-2 DETERMINISTIC FALLBACK:
            console.warn("[QUESTION TIER-2] AI failed or produced empty questions. Engaging deterministic fallback...");
            return buildDeterministicQuestions(stage, quizType);
        }

    } catch {
        // TIER-2 DETERMINISTIC FALLBACK:
        console.warn("[QUESTION TIER-2] AI failed or produced empty questions. Engaging deterministic fallback...");
        return buildDeterministicQuestions(stage, quizType);
    }

    console.log(`[STAGE QUESTIONS READY: ${normalizedQuestions.length} questions for ${stage.items.length} items]`);

    const validated = QuestionsResponseSchema.parse({ questions: normalizedQuestions });
    return validated.questions;
}
