/**
 * Fixed-window in-memory rate limiter. Best-effort: each serverless instance
 * keeps its own counters, which is enough to blunt scripted spam at an event.
 * Swap for a shared store (e.g. Upstash Redis) if stricter limits are needed.
 */
export interface RateLimiter {
  check(key: string, now?: number): { allowed: boolean; retryAfterSec: number };
}

export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return {
    check(key, now = Date.now()) {
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      }
      const entry = hits.get(key);
      if (!entry || entry.resetAt <= now) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSec: 0 };
      }
      entry.count += 1;
      return {
        allowed: entry.count <= limit,
        retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
      };
    },
  };
}

export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? headers.get("x-real-ip") ?? "unknown").trim();
}
