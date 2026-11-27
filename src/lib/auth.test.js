import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { hashPassword, verifyPassword } from "./auth";
import { signSessionToken, verifySessionToken } from "./sessionToken";

describe("auth security helpers", () => {
  beforeEach(() =>
    vi.stubEnv(
      "ADMIN_SESSION_SECRET",
      "test-only-secret-012345678901234567890",
    ),
  );
  afterEach(() => vi.unstubAllEnvs());
  it("hashes and verifies passwords using scrypt", () => {
    const hash = hashPassword("rahasia-kuat-123");
    expect(hash).toContain(":");
    expect(verifyPassword("rahasia-kuat-123", hash)).toBe(true);
    expect(verifyPassword("salah", hash)).toBe(false);
    expect(verifyPassword("rahasia-kuat-123", "invalid-format")).toBe(false);
  });

  it("signs and verifies HMAC session tokens and rejects tampering", async () => {
    const token = await signSessionToken(
      { sub: "adm_1", username: "admin" },
      60,
    );
    const payload = await verifySessionToken(token);
    expect(payload?.sub).toBe("adm_1");
    expect(payload?.username).toBe("admin");

    const tampered = `${token.slice(0, -2)}xx`;
    expect(await verifySessionToken(tampered)).toBeNull();
    expect(await verifySessionToken("true")).toBeNull();
  });
});
