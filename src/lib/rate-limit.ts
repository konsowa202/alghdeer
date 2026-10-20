/**
 * In-memory fixed-window rate limiter (per serverless instance).
 * Sufficient to blunt brute-force and form-spam on a single-instance or
 * low-traffic deployment; for multi-region scale swap the bucket store for
 * Upstash Redis / Vercel KV with the same interface.
 */

type Bucket = { count: number; resetAt: number };

declare global {
  // eslint-disable-next-line no-var
  var __alghdeer_rate_buckets__: Map<string, Bucket> | undefined;
}

function buckets(): Map<string, Bucket> {
  if (!globalThis.__alghdeer_rate_buckets__) {
    globalThis.__alghdeer_rate_buckets__ = new Map();
  }
  return globalThis.__alghdeer_rate_buckets__;
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const store = buckets();
  const b = store.get(key);

  if (!b || b.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  if (b.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
    };
  }

  b.count += 1;
  return { ok: true, remaining: limit - b.count, retryAfterSec: 0 };
}

/** Best-effort client IP extraction (works on Vercel / proxies). */
export function clientIp(req: Request): string {
  const h = req.headers;
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return (
    h.get("x-real-ip") ||
    (req as unknown as { ip?: string }).ip ||
    "unknown"
  );
}
