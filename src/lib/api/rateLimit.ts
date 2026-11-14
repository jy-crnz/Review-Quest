/**
 * Fixed-window, in-memory rate limiter keyed by route + client IP.
 *
 * LIMITATIONS (be aware before relying on it in production):
 * - State lives in this server process. On serverless platforms each instance
 *   keeps its own counters, so the real limit is "per instance". It still stops
 *   casual abuse; for strict limits use a shared store (e.g. Upstash Redis).
 * - The client IP comes from `x-forwarded-for`. That is only trustworthy behind a
 *   proxy/platform that sets or overwrites it (e.g. Vercel). Behind anything
 *   else, clients can spoof it.
 * - Students sharing one network (a school) share one IP, so raise
 *   RATE_LIMIT_PER_MINUTE if legitimate users get blocked.
 */

const WINDOW_MS = 60_000;
const DEFAULT_LIMIT_PER_MINUTE = 30;
const SWEEP_THRESHOLD = 5_000;

interface Bucket {
    count: number;
    resetAt: number;
}

// Stored on globalThis so dev-server hot reloads don't reset the counters.
const globalStore = globalThis as unknown as { __rqRateBuckets?: Map<string, Bucket> };
const buckets: Map<string, Bucket> = (globalStore.__rqRateBuckets ??= new Map());

function limitPerMinute(): number {
    const parsed = Number.parseInt(process.env.RATE_LIMIT_PER_MINUTE ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_LIMIT_PER_MINUTE;
}

export function getClientIp(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        const first = forwarded.split(',')[0]?.trim();
        if (first) return first;
    }
    return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

function sweepExpired(now: number): void {
    for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(key);
    }
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function checkRateLimit(req: Request, routeKey: string): RateLimitResult {
    const now = Date.now();
    if (buckets.size > SWEEP_THRESHOLD) sweepExpired(now);

    const key = `${routeKey}:${getClientIp(req)}`;
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return { ok: true };
    }

    if (bucket.count >= limitPerMinute()) {
        return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
    }

    bucket.count += 1;
    return { ok: true };
}
