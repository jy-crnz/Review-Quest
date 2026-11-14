import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from './rateLimit';

/**
 * Shared request handling for API routes:
 *   rate limit -> size-limited body read -> JSON parse -> Zod validation.
 * Every error uses the same shape: { error: { code, message } }.
 * Messages are generic on purpose; details go to server logs only.
 */

export type ApiErrorCode =
    | 'INVALID_INPUT'
    | 'INVALID_FILE'
    | 'PAYLOAD_TOO_LARGE'
    | 'RATE_LIMITED'
    | 'AI_FAILED'
    | 'SYLLABUS_FAILED'
    | 'GENERATION_FAILED'
    | 'EXTRACTION_FAILED'
    | 'SERVER_ERROR';

export function jsonError(
    code: ApiErrorCode,
    message: string,
    status: number,
    headers?: Record<string, string>
): NextResponse {
    return NextResponse.json({ error: { code, message } }, { status, headers });
}

export function rateLimitGuard(req: Request, routeKey: string): NextResponse | null {
    const result = checkRateLimit(req, routeKey);
    if (result.ok) return null;
    return jsonError(
        'RATE_LIMITED',
        `Too many requests. Please wait ${result.retryAfterSeconds}s and try again.`,
        429,
        { 'Retry-After': String(result.retryAfterSeconds) }
    );
}

/**
 * Reads the request body but gives up (returns null) as soon as it exceeds
 * `maxBytes`, so oversized or chunked bodies never get fully buffered.
 */
export async function readBodyLimited(req: Request, maxBytes: number): Promise<Buffer | null> {
    const declared = Number(req.headers.get('content-length'));
    if (Number.isFinite(declared) && declared > maxBytes) return null;
    if (!req.body) return Buffer.alloc(0);

    const reader = req.body.getReader();
    const chunks: Buffer[] = [];
    let total = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > maxBytes) {
            await reader.cancel();
            return null;
        }
        chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks);
}

type ParseResult<S extends z.ZodType> =
    | { ok: true; data: z.output<S> }
    | { ok: false; response: NextResponse };

export async function parseJsonRequest<S extends z.ZodType>(
    req: Request,
    opts: { routeKey: string; schema: S; maxBytes: number }
): Promise<ParseResult<S>> {
    const limited = rateLimitGuard(req, opts.routeKey);
    if (limited) return { ok: false, response: limited };

    const raw = await readBodyLimited(req, opts.maxBytes);
    if (raw === null) {
        return {
            ok: false,
            response: jsonError('PAYLOAD_TOO_LARGE', 'Request is too large.', 413),
        };
    }

    let json: unknown;
    try {
        json = JSON.parse(raw.toString('utf8'));
    } catch {
        return { ok: false, response: jsonError('INVALID_INPUT', 'Request body must be valid JSON.', 400) };
    }

    const parsed = opts.schema.safeParse(json);
    if (!parsed.success) {
        return {
            ok: false,
            response: jsonError('INVALID_INPUT', 'Request is missing required data or has invalid fields.', 400),
        };
    }

    return { ok: true, data: parsed.data };
}
