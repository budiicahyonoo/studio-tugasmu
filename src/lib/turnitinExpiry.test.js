import { describe, expect, it, vi } from "vitest";
import { expireExpiredTurnitinPayments } from "./turnitinExpiry";

function databaseWith(overdue = []) {
  const tx = {
    pembayaran: {
      findMany: vi.fn().mockResolvedValue(overdue),
      updateMany: vi.fn().mockResolvedValue({ count: overdue.length }),
    },
    pesanan: {
      updateMany: vi.fn().mockResolvedValue({ count: overdue.length }),
    },
  };
  const database = {
    $transaction: vi.fn((callback) => callback(tx)),
  };
  return { database, tx };
}

describe("scheduled Turnitin expiry", () => {
  it("expires only pending payments at or before the supplied time", async () => {
    const now = new Date("2026-11-28T10:00:00.000Z");
    const { database, tx } = databaseWith([
      { id: "payment-1", pesananId: "order-1" },
    ]);

    await expect(
      expireExpiredTurnitinPayments({ database, now, limit: 100 }),
    ).resolves.toEqual({ expired: 1, hasMore: false });

    expect(tx.pembayaran.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        status: "MENUNGGU_PEMBAYARAN",
        kedaluwarsaPada: { lte: now },
        pesanan: { deletedAt: null },
      },
      orderBy: [{ kedaluwarsaPada: "asc" }, { id: "asc" }],
      take: 100,
      select: { id: true, pesananId: true },
    });
    expect(tx.pembayaran.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["payment-1"] },
        deletedAt: null,
        status: "MENUNGGU_PEMBAYARAN",
        kedaluwarsaPada: { lte: now },
      },
      data: { status: "KEDALUWARSA" },
    });
    expect(tx.pesanan.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["order-1"] },
        deletedAt: null,
        status: "MENUNGGU_PEMBAYARAN",
      },
      data: { status: "KEDALUWARSA" },
    });
  });

  it("does not update orders when there are no overdue payments", async () => {
    const { database, tx } = databaseWith();

    await expect(expireExpiredTurnitinPayments({ database })).resolves.toEqual({
      expired: 0,
      hasMore: false,
    });

    expect(tx.pembayaran.updateMany).not.toHaveBeenCalled();
    expect(tx.pesanan.updateMany).not.toHaveBeenCalled();
  });
});
