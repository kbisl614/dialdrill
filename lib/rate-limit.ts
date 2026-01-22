/**
 * Simple in-memory rate limiter for serverless environments.
 * For 10-100 users this is sufficient. For larger scale, use Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (resets on cold starts, which is fine for basic protection)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically to prevent memory leaks
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (usually `${route}:${userId}`)
 * @param config - Rate limit configuration
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupExpiredEntries();

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = identifier;

  const entry = rateLimitStore.get(key);

  // No existing entry or window expired - create new entry
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, newEntry);

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Within window - check limit
  if (entry.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  };
}

// Preset configurations for different route types
export const RATE_LIMITS = {
  // Expensive operations (AI calls, ElevenLabs)
  expensive: { limit: 10, windowSeconds: 60 },      // 10 per minute

  // Payment operations
  payment: { limit: 5, windowSeconds: 60 },         // 5 per minute

  // Standard API calls
  standard: { limit: 30, windowSeconds: 60 },       // 30 per minute

  // Read-heavy endpoints
  read: { limit: 60, windowSeconds: 60 },           // 60 per minute

  // Webhook endpoints (from trusted sources)
  webhook: { limit: 100, windowSeconds: 60 },       // 100 per minute
} as const;

/**
 * Helper to create rate limit response headers
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString(),
  };
}
