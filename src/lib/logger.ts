/**
 * Dev-only logging. Verbose "status banner" logs stay out of production
 * server logs. Use console.error directly for real failures.
 */
const isDev = process.env.NODE_ENV !== 'production';

export function devLog(...args: unknown[]): void {
    if (isDev) console.log(...args);
}
