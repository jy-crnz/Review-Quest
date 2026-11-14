import { z } from 'zod';
import { MAX_STUDY_TEXT_CHARS } from './limits';

/** Request-body schemas for the API routes. Bounded so clients can't send huge or malformed payloads. */

export const QuizTypeSchema = z.enum(['multiple-choice', 'true-false', 'enumeration']);

const studyText = z
    .string()
    .max(MAX_STUDY_TEXT_CHARS)
    .refine((text) => text.trim().length >= 30, 'Insufficient study text.');

export const SyllabusRequestSchema = z.object({
    text: studyText,
});

export const GenerateRequestSchema = z.object({
    text: studyText,
    quizType: QuizTypeSchema,
});

const StageItemRequestSchema = z.object({
    term: z.string().max(500),
    description: z.string().max(2000),
});

export const GenerateStageRequestSchema = z.object({
    stage: z.object({
        stageIndex: z.number(),
        title: z.string().max(300),
        enemyId: z.string().max(64).default('vanguard_scout'),
        summary: z.string().max(1000).optional(),
        items: z.array(StageItemRequestSchema).min(1).max(50),
    }),
    // Matches previous behavior: missing quizType falls back to multiple-choice.
    quizType: QuizTypeSchema.default('multiple-choice'),
});
