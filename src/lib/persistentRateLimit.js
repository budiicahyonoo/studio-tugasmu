import { createHash } from "node:crypto";
import { prisma } from "./prisma";
import {
  checkRateLimit as memoryRateLimit,
  resetRateLimit as resetMemoryRateLimit,
} from "./rateLimit";

export async function checkRateLimit(
  key,
  { limit = 5, windowMs = 900000 } = {},
) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  const hash = createHash("sha256").update(key).digest("hex");
  let timer;
  try {
    const query = prisma.$queryRaw`
      INSERT INTO "RateLimit" ("key", "count", "resetAt") VALUES (${hash}, 1, ${resetAt})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN 1 ELSE LEAST("RateLimit"."count" + 1, ${limit + 1}) END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN ${resetAt} ELSE "RateLimit"."resetAt" END
      RETURNING "count", "resetAt"
    `;
    const rows = await Promise.race([
      query,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Rate limiter timeout")),
          1500,
        );
      }),
    ]);
    if (Math.random() < 0.02)
      prisma.rateLimit
        .deleteMany({ where: { resetAt: { lt: now } } })
        .catch(() => {});
    const row = rows[0];
    return {
      allowed: row.count <= limit,
      remaining: Math.max(0, limit - row.count),
      resetAt: row.resetAt.getTime(),
    };
  } catch {
    // Public forms remain usable during a database outage; auth still requires a database.
    return memoryRateLimit(key, { limit, windowMs });
  } finally {
    clearTimeout(timer);
  }
}
export async function resetRateLimit(key) {
  resetMemoryRateLimit(key);
  const hash = createHash("sha256").update(key).digest("hex");
  await prisma.rateLimit.deleteMany({ where: { key: hash } }).catch(() => {});
}
