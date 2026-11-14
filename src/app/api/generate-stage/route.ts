import { NextResponse } from 'next/server';
import { generateStageQuestions } from '@/features/game/services/stageQuestionService';
import { jsonError, parseJsonRequest } from '@/lib/api/http';
import { MAX_STAGE_BODY_BYTES } from '@/lib/api/limits';
import { GenerateStageRequestSchema } from '@/lib/api/schemas';
import { devLog } from '@/lib/logger';

export async function POST(req: Request) {
    const parsed = await parseJsonRequest(req, {
        routeKey: 'generate-stage',
        schema: GenerateStageRequestSchema,
        maxBytes: MAX_STAGE_BODY_BYTES,
    });
    if (!parsed.ok) return parsed.response;

    const { stage, quizType } = parsed.data;

    try {
        devLog(`--- [JIT ARCHITECT: GENERATING QUESTIONS FOR ${stage.title}] ---`);
        const questions = await generateStageQuestions(stage, quizType);
        devLog(`--- [JIT SUCCESS: ${questions.length} QUESTIONS READY] ---`);

        return NextResponse.json({ questions });
    } catch (error) {
        console.error('STAGE_GENERATION_CRASH:', error);
        return jsonError('GENERATION_FAILED', 'Failed to generate stage questions. Please try again.', 500);
    }
}
