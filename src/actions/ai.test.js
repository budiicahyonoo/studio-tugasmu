import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("../lib/persistentRateLimit", () => ({
  checkRateLimit: () => ({ allowed: true }),
}));
import { polishDescription } from "./ai";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe("description polishing", () => {
  it("falls back to the original without provider credentials", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const result = await polishDescription({
      deskripsi: "tolong rapikan deskripsi ini",
    });
    expect(result).toMatchObject({
      ok: false,
      deskripsiRapih: "tolong rapikan deskripsi ini",
    });
  });
  it("does not accept a model that changes the requested quantity", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-only");
    vi.stubEnv("OPENROUTER_API_KEY", "");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Buat 30 slide." } }],
        }),
      }),
    );
    expect(
      (await polishDescription({ deskripsi: "buat 15 slide" })).usedFallback,
    ).toBe(true);
  });
  it("uses the backup after a provider failure", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-only");
    vi.stubEnv("OPENROUTER_API_KEY", "test-only");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: "Buat 15 slide." } }],
          }),
        }),
    );
    expect(
      await polishDescription({ deskripsi: "buat 15 slide" }),
    ).toMatchObject({ ok: true, deskripsiRapih: "Buat 15 slide." });
  });
  it("returns the original in a shared timeout budget below ten seconds", async () => {
    vi.useFakeTimers();
    vi.stubEnv("GROQ_API_KEY", "test-only");
    vi.stubEnv("OPENROUTER_API_KEY", "test-only");
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url, options) =>
          new Promise((_resolve, reject) =>
            options.signal.addEventListener("abort", () =>
              reject(new Error("aborted")),
            ),
          ),
      ),
    );
    const result = polishDescription({ deskripsi: "buat 15 slide" });
    await vi.advanceTimersByTimeAsync(9100);
    expect(await result).toMatchObject({
      ok: false,
      deskripsiRapih: "buat 15 slide",
    });
  });
});
