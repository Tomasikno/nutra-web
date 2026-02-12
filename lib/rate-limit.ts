import "server-only";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis =
  redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const limiters = new Map<string, Ratelimit>();

function getLimiter(scope: string, limit: number, window: Parameters<typeof Ratelimit.slidingWindow>[1]): Ratelimit | null {
  if (!redis) return null;

  const key = `${scope}:${limit}:${window}`;
  if (!limiters.has(key)) {
    limiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, window),
        analytics: true,
        prefix: `nutra-web:${scope}`,
      }),
    );
  }
  return limiters.get(key)!;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

/**
 * Check rate limit by an arbitrary identifier (IP, email, etc.).
 * Fails open when Upstash is not configured (local dev).
 */
export async function checkRateLimit(
  identifier: string,
  scope: string,
  limit: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
): Promise<RateLimitResult> {
  const limiter = getLimiter(scope, limit, window);
  if (!limiter) {
    return { allowed: true, remaining: limit };
  }

  try {
    const { success, remaining } = await limiter.limit(identifier);
    return { allowed: success, remaining };
  } catch (error) {
    console.error(`Rate limit check failed for ${scope}:`, error);
    return { allowed: true, remaining: limit };
  }
}
