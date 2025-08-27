/**
 * Simple in-memory rate limiter (per key) for serverless/edge development.
 * For production at scale replace with Redis/Upstash durable storage.
 */

interface Bucket {
  count: number;
  expiresAt: number;
}

const store = new Map<string, Bucket>();

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10); // 1 minute default
const MAX = parseInt(process.env.RATE_LIMIT_MAX || "30", 10); // 30 requests per window default

export interface RateLimitResult {
  limited: boolean;
  success?: boolean; // For backward compatibility
  remaining: number;
  reset: number; // epoch ms
  limit: number;
}

export function rateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.expiresAt <= now) {
    const bucket: Bucket = { count: 1, expiresAt: now + WINDOW_MS };
    store.set(key, bucket);
    return {
      limited: false,
      success: true,
      remaining: MAX - 1,
      reset: bucket.expiresAt,
      limit: MAX,
    };
  }

  if (existing.count >= MAX) {
    return {
      limited: true,
      success: false,
      remaining: 0,
      reset: existing.expiresAt,
      limit: MAX,
    };
  }

  existing.count += 1;
  return {
    limited: false,
    success: true,
    remaining: MAX - existing.count,
    reset: existing.expiresAt,
    limit: MAX,
  };
}

export function rateLimitKey(
  userId?: string | null,
  ip?: string | null
): string {
  return userId ? `user:${userId}` : `ip:${ip || "unknown"}`;
}

export function rateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };
}
