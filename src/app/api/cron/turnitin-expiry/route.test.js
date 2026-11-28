import { beforeEach, describe, expect, it, vi } from "vitest";

const { expireExpiredTurnitinPayments } = vi.hoisted(() => ({
  expireExpiredTurnitinPayments: vi.fn(),
}));

vi.mock("../../../../lib/turnitinExpiry", () => ({
  expireExpiredTurnitinPayments,
}));

import { GET } from "./route";

describe("Turnitin expiry cron route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("CRON_SECRET", "cron-test-secret");
  });

  it("requires the configured bearer secret", async () => {
    const response = await GET(new Request("https://example.test/api/cron"));
    expect(response.status).toBe(401);
    expect(expireExpiredTurnitinPayments).not.toHaveBeenCalled();
  });

  it("expires a bounded batch with valid authorization", async () => {
    expireExpiredTurnitinPayments.mockResolvedValue({
      expired: 2,
      hasMore: false,
    });
    const response = await GET(
      new Request("https://example.test/api/cron", {
        headers: { authorization: "Bearer cron-test-secret" },
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      expired: 2,
      hasMore: false,
    });
    expect(expireExpiredTurnitinPayments).toHaveBeenCalledWith({ limit: 500 });
  });

  it("returns a service error when expiry processing fails", async () => {
    expireExpiredTurnitinPayments.mockRejectedValue(
      new Error("database error"),
    );
    const response = await GET(
      new Request("https://example.test/api/cron", {
        headers: { authorization: "Bearer cron-test-secret" },
      }),
    );
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Status pembayaran belum dapat diperbarui.",
    });
  });
});
