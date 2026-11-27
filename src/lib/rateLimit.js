/** @type {Map<string, {count: number, resetAt: number}>} */
const buckets = new Map();

/** @param {string} key */
export function checkRateLimit(
  key,
  { limit = 5, windowMs = 15 * 60 * 1000 } = {},
) {
  const now = Date.now();
  if (buckets.size > 10000) {
    for (const [bucketKey, bucket] of buckets)
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    if (buckets.size > 10000 && !buckets.has(key))
      return { allowed: false, remaining: 0, resetAt: now + windowMs };
  }
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/** @param {string} key */
export function resetRateLimit(key) {
  buckets.delete(key);
}
