import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  rateLimit: { deleteMany: vi.fn() },
}));
vi.mock("./prisma", () => ({ prisma: db }));
import { checkRateLimit } from "./persistentRateLimit";
beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(Math, "random").mockReturnValue(0.5);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
describe("shared rate limit", () => {
  it("uses the atomic database counter for a request", async () => {
    db.$queryRaw.mockResolvedValue([
      { count: 3, resetAt: new Date(Date.now() + 60000) },
    ]);
    expect(await checkRateLimit("qa-rate-1", { limit: 5 })).toMatchObject({
      allowed: true,
      remaining: 2,
    });
  });
  it("rejects a counter above the limit", async () => {
    db.$queryRaw.mockResolvedValue([
      { count: 6, resetAt: new Date(Date.now() + 60000) },
    ]);
    expect(await checkRateLimit("qa-rate-2", { limit: 5 })).toMatchObject({
      allowed: false,
      remaining: 0,
    });
  });
  it("falls back locally if the database cannot answer within the deadline", async () => {
    vi.useFakeTimers();
    db.$queryRaw.mockReturnValue(new Promise(() => {}));
    const result = checkRateLimit("qa-rate-3", { limit: 5 });
    await vi.advanceTimersByTimeAsync(1501);
    expect(await result).toMatchObject({ allowed: true, remaining: 4 });
  });
});
