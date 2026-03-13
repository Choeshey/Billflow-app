import { NextResponse, type NextRequest } from "next/server";

// ── In-memory rate limiter (works without Redis) ───────────────────────────
interface RateEntry { count: number; resetAt: number; }
const store = new Map<string, RateEntry>();

interface RateLimitOptions {
    limit:      number;  // max requests
    windowMs:   number;  // window in ms
}

/**
 * Check rate limit for a given key (usually IP + route).
 * Returns null if allowed, or a 429 NextResponse if blocked.
 */
export function rateLimit(
    request: NextRequest,
    options: RateLimitOptions = { limit: 10, windowMs: 60_000 }
): NextResponse | null {
    const ip  = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        ?? request.headers.get("x-real-ip")
        ?? "unknown";
    const key = `${ip}:${request.nextUrl.pathname}`;
    const now = Date.now();

    // Clean expired entries every 100 requests to prevent memory leak
    if (store.size > 1000) {
        for (const [k, v] of store.entries()) {
            if (v.resetAt < now) store.delete(k);
        }
    }

    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
        store.set(key, { count: 1, resetAt: now + options.windowMs });
        return null;
    }

    entry.count++;

    if (entry.count > options.limit) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return NextResponse.json(
            { success: false, error: "Too many requests. Please slow down." },
            {
                status: 429,
                headers: {
                    "Retry-After":        String(retryAfter),
                    "X-RateLimit-Limit":  String(options.limit),
                    "X-RateLimit-Reset":  String(entry.resetAt),
                },
            }
        );
    }

    return null;
}

/**
 * Strict limiter for auth routes — 5 attempts per minute.
 * Usage: const blocked = authRateLimit(request); if (blocked) return blocked;
 */
export function authRateLimit(request: NextRequest): NextResponse | null {
    return rateLimit(request, { limit: 5, windowMs: 60_000 });
}