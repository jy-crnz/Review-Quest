/**
 * Central limits for the API routes. Keep them in one place so the client,
 * the routes, and the docs can't drift apart.
 */

/** Max PDF upload size. Mirrored in FileUpload.tsx. */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/** Extra room for multipart boundaries/headers on top of the file itself. */
export const MULTIPART_OVERHEAD_BYTES = 256 * 1024;

/** Max PDF pages we will read. Extra pages are ignored (response is flagged `truncated`). */
export const MAX_PDF_PAGES = 500;

/** Soft time budget for PDF text extraction. Extra pages are ignored once exceeded. */
export const EXTRACT_TIME_BUDGET_MS = 20_000;

/**
 * Max characters of study text we accept or return.
 * NOTE: the syllabus prompt currently only reads the first 80,000 characters,
 * so this is intentionally generous.
 */
export const MAX_STUDY_TEXT_CHARS = 300_000;

/** Max JSON body size for routes that receive study text (UTF-8 can be up to 4 bytes/char). */
export const MAX_TEXT_BODY_BYTES = 1_500_000;

/** Max JSON body size for routes that receive a single stage (small objects). */
export const MAX_STAGE_BODY_BYTES = 100_000;
