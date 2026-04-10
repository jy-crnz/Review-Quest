import { NextResponse } from 'next/server';
import { generateBossBattle } from '@/features/game/services/aiService';

/**
 * ARCHITECTURE: Generation Phase (The Sandbox Architect)
 * FEATURE: Receives cached text and a specific protocol to manifest the boss.
 */
export async function POST(req: Request) {
    try {
        // 🎯 THE FIX: Read JSON body instead of FormData.
        // The ModeSelector component sends 'text' and 'quizType' as a JSON object.
        const body = await req.json();
        const { text, quizType } = body;

        // 1. Boundary Checks
        if (!text || !quizType) {
            return NextResponse.json(
                { 
                    error: { 
                        code: 'MISSING_DATA', 
                        message: 'Intel text or challenge protocol is missing.' 
                    } 
                },
                { status: 400 }
            );
        }

        // --- 2. Service Layer: AI Generation ---
        try {
            console.log(`--- [ARCHITECT: BUILDING ${quizType.toUpperCase()} ENCOUNTER] ---`);

            // Pass the cached text and the user's chosen mode to the AI generator
            const battleData = await generateBossBattle(text, quizType as any);

            console.log(`--- [AI SUCCESS: ${battleData.bossName} MANIFESTED] ---`);

            // Return the full battle object (subject, boss details, questions)
            return NextResponse.json(battleData);

        } catch (aiError: any) {
            console.error('AI_GENERATION_CRASH:', aiError);
            
            // Return 503 (Service Unavailable) if the AI fails or produces malformed JSON
            return NextResponse.json(
                { 
                    error: { 
                        code: 'AI_FAILED', 
                        message: aiError.message || 'The AI Boss successfully jammed the frequency.' 
                    } 
                },
                { status: 503 }
            );
        }

    } catch (error: any) {
        console.error('SERVER_CRASH_DETAILS:', error);

        // General fallback for protocol or syntax errors
        return NextResponse.json(
            { 
                error: { 
                    code: 'SERVER_ERROR', 
                    message: 'The Battle Architect encountered a protocol failure.' 
                } 
            },
            { status: 500 }
        );
    }
}