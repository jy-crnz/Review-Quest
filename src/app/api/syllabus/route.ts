import { NextResponse } from 'next/server';
import { extractReviewerSyllabus } from '@/features/game/services/syllabusService';
import { jsonError, parseJsonRequest } from '@/lib/api/http';
import { MAX_TEXT_BODY_BYTES } from '@/lib/api/limits';
import { SyllabusRequestSchema } from '@/lib/api/schemas';
import { devLog } from '@/lib/logger';

export async function POST(req: Request) {
    const parsed = await parseJsonRequest(req, {
        routeKey: 'syllabus',
        schema: SyllabusRequestSchema,
        maxBytes: MAX_TEXT_BODY_BYTES,
    });
    if (!parsed.ok) return parsed.response;

    try {
        devLog('--- [SYLLABUS ARCHITECT: DECONSTRUCTING DOCUMENT] ---');
        const syllabus = await extractReviewerSyllabus(parsed.data.text);
        devLog(`--- [SYLLABUS SUCCESS: ${syllabus.stages.length} STAGES EXTRACTED] ---`);

        return NextResponse.json(syllabus);
    } catch (error) {
        // Details stay in server logs; the client only gets a generic message.
        console.error('SYLLABUS_CRASH:', error);
        return jsonError('SYLLABUS_FAILED', 'Failed to extract study syllabus. Please try again.', 500);
    }
}
