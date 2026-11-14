import { NextResponse } from 'next/server';
import { generateStageQuestions } from '@/features/game/services/stageQuestionService';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { stage, quizType } = body;

        if (!stage || !stage.items || stage.items.length === 0) {
            return NextResponse.json(
                { error: { code: 'INVALID_STAGE', message: 'Stage data with items is required.' } },
                { status: 400 }
            );
        }

        console.log(`--- [JIT ARCHITECT: GENERATING QUESTIONS FOR ${stage.title}] ---`);
        const questions = await generateStageQuestions(stage, quizType || 'multiple-choice');
        console.log(`--- [JIT SUCCESS: ${questions.length} QUESTIONS READY] ---`);

        return NextResponse.json({ questions });
    } catch (error: any) {
        console.error('STAGE_GENERATION_CRASH:', error);
        return NextResponse.json(
            { error: { code: 'GENERATION_FAILED', message: error.message || 'Failed to generate stage questions.' } },
            { status: 500 }
        );
    }
}
