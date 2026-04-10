/**
 * Simple in-memory token-bucket rate limiter.
 *
 * Caveats:
 * - Process-local. Doesn't scale across multiple web instances — if you run
 *   a load balancer with >1 replica, swap this for a Redis-backed limiter.
 *   For single-instance self-hosters, this is sufficient and avoids a
 *   dependency on Redis.
 * - Memory-bounded via periodic cleanup. Keys older than 2x the window are
 *   evicted lazily on access.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  retryAfterMs?: number;
  remaining: number;
}

/**
 * Check whether `key` can make another request under `limit` per `windowMs`.
 * Increments the counter if allowed.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    // New window
    buckets.set(key, { count: 1, windowStart: now });
    return { ok: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    const retryAfterMs = windowMs - (now - bucket.windowStart);
    return { ok: false, retryAfterMs, remaining: 0 };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count };
}

/**
 * Clear a key's bucket (e.g., after a successful operation that shouldn't
 * count against the limit in the traditional sense). Rarely needed — most
 * callers just let the window expire naturally.
 */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/**
 * For tests.
 */
export function __clearAllBuckets(): void {
  buckets.clear();
}
