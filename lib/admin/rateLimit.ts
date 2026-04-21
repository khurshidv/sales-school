import 'server-only';

// Simple in-memory token bucket for per-IP rate limiting.
// Good enough for /admin/login on a single Vercel instance.
// For multi-region deployment switch to Upstash/Redis.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

export interface RateLimitOpts {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

export function rateLimit(key: string, opts: RateLimitOpts): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size > MAX_BUCKETS) {
      // Evict expired entries lazily when over soft cap.
      for (const [k, b] of buckets) {
        if (b.resetAt <= now) buckets.delete(k);
      }
    }
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, remaining: opts.limit - 1, resetInMs: opts.windowMs };
  }

  existing.count += 1;
  const resetInMs = existing.resetAt - now;

  if (existing.count > opts.limit) {
    return { allowed: false, remaining: 0, resetInMs };
  }

  return { allowed: true, remaining: opts.limit - existing.count, resetInMs };
}

export function _resetRateLimitForTest(): void {
  buckets.clear();
}
