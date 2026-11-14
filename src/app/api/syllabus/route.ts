import { NextResponse } from 'next/server';
import { extractReviewerSyllabus } from '@/features/game/services/syllabusService';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text } = body;

        if (!text || typeof text !== 'string' || text.trim().length < 30) {
            return NextResponse.json(
                { error: { code: 'INVALID_INPUT', message: 'Insufficient study text for extraction.' } },
                { status: 400 }
            );
        }

        console.log(`--- [SYLLABUS ARCHITECT: DECONSTRUCTING DOCUMENT] ---`);
        const syllabus = await extractReviewerSyllabus(text);
        console.log(`--- [SYLLABUS SUCCESS: ${syllabus.stages.length} STAGES EXTRACTED] ---`);

        return NextResponse.json(syllabus);
    } catch (error: any) {
        console.error('SYLLABUS_CRASH:', error);
        return NextResponse.json(
            { error: { code: 'SYLLABUS_FAILED', message: error.message || 'Failed to extract study syllabus.' } },
            { status: 500 }
        );
    }
}
