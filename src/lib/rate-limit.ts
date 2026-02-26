/**
 * In-memory sliding-window rate limiter.
 * Suitable for single-server / serverless (Vercel) deployments.
 * Each Vercel function instance keeps its own window — still effective
 * because hot instances serve the majority of traffic bursts.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodically clean up expired entries (every 60 s)
let cleanupScheduled = false;
function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 60_000);
}

interface RateLimitOptions {
  /** Maximum requests allowed in the window */
  limit?: number;
  /** Window size in seconds */
  windowSec?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if the given key (usually IP or userId) is within the rate limit.
 */
export function rateLimit(
  key: string,
  { limit = 10, windowSec = 60 }: RateLimitOptions = {}
): RateLimitResult {
  scheduleCleanup();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    const resetAt = now + windowSec * 1000;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  entry.count++;
  if (entry.count > limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Get the IP address from a NextRequest (works on Vercel and locally).
 */
export function getIP(req: { headers: { get(name: string): string | null } }): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
