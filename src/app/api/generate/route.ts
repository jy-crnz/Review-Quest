import { NextResponse } from 'next/server';
import { generateBossBattle } from '@/features/game/services/aiService';
import { jsonError, parseJsonRequest } from '@/lib/api/http';
import { MAX_TEXT_BODY_BYTES } from '@/lib/api/limits';
import { GenerateRequestSchema } from '@/lib/api/schemas';
import { devLog } from '@/lib/logger';

/**
 * ARCHITECTURE: Generation Phase (The Sandbox Architect)
 * FEATURE: Receives cached text and a specific protocol to manifest the boss.
 *
 * NOTE: nothing in the client calls this route anymore (the app uses
 * /api/syllabus + /api/generate-stage). Consider deleting it.
 */
export async function POST(req: Request) {
    const parsed = await parseJsonRequest(req, {
        routeKey: 'generate',
        schema: GenerateRequestSchema,
        maxBytes: MAX_TEXT_BODY_BYTES,
    });
    if (!parsed.ok) return parsed.response;

    const { text, quizType } = parsed.data;

    try {
        devLog(`--- [ARCHITECT: BUILDING ${quizType.toUpperCase()} ENCOUNTER] ---`);
        const battleData = await generateBossBattle(text, quizType);
        devLog(`--- [AI SUCCESS: ${battleData.title} MANIFESTED] ---`);

        return NextResponse.json(battleData);
    } catch (error) {
        console.error('AI_GENERATION_CRASH:', error);
        return jsonError('AI_FAILED', 'The AI could not generate this encounter. Please try again.', 503);
    }
}
