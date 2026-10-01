/**
 * In-memory fixed-window rate limiter (per server instance).
 * V1 note: adequate for a single deployment instance. For multi-instance
 * (Vercel serverless) move to Upstash Redis — documented in docs/SECURITY.md.
 * LIMITATION (explicit): this is a PER-PROCESS, in-memory limiter. It does
 * NOT provide globally distributed rate limiting — each instance/serverless
 * function keeps its own counters, so effective limits scale with instance
 * count. It is deliberately small and replaceable (fixed window, Map-based)
 * so it can be swapped for a shared store later without touching call sites.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

export function clientKey(scope: string, identifier: string, ip: string | null): string {
  return `${scope}:${identifier}:${ip ?? "unknown"}`;
}

// Periodically clear expired buckets so the Map does not grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
  }
}, 60_000).unref();
