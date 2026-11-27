import { beforeEach, describe, expect, it, vi } from "vitest";
const { db, requireAdmin } = vi.hoisted(() => {
  const model = () =>
    Object.fromEntries(
      [
        "findUnique",
        "findUniqueOrThrow",
        "findMany",
        "count",
        "create",
        "update",
        "updateMany",
        "upsert",
        "delete",
      ].map((method) => [method, vi.fn()]),
    );
  const db = Object.fromEntries(
    [
      "layanan",
      "fakultas",
      "tarif",
      "paket",
      "benefit",
      "pesanan",
      "pembayaran",
      "pengaturan",
      "riwayatHarga",
      "faq",
      "galeriUlasan",
      "kategori",
    ].map((name) => [name, model()]),
  );
  db.$transaction = vi.fn();
  return { db, requireAdmin: vi.fn() };
});
vi.mock("../lib/prisma", () => ({ prisma: db }));
vi.mock("../lib/auth", () => ({ requireAdminSession: requireAdmin }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("../lib/uploads", () => ({
  uploadFile: vi.fn(),
  removeUpload: vi.fn(),
}));
import * as admin from "./admin";
import * as content from "./content";
const form = (data) => {
  const f = new FormData();
  for (const [key, value] of Object.entries(data)) f.set(key, String(value));
  return f;
};
beforeEach(() => {
  vi.resetAllMocks();
  requireAdmin.mockResolvedValue({ username: "test-admin" });
  db.$transaction.mockImplementation(async (arg) =>
    typeof arg === "function" ? arg(db) : Promise.all(arg),
  );
});
describe("admin authorization", () => {
  for (const [name, action] of Object.entries({ ...admin, ...content }))
    it(`${name} rejects a missing session before touching data`, async () => {
      requireAdmin.mockRejectedValue(new Error("invalid session"));
      await expect(action(new FormData())).rejects.toThrow("invalid session");
      expect(db.$transaction).not.toHaveBeenCalled();
      for (const model of Object.values(db))
        if (typeof model === "object")
          for (const method of Object.values(model))
            expect(method).not.toHaveBeenCalled();
    });
});
describe("admin mutations", () => {
  it("records a rate change in the same serializable transaction", async () => {
    db.layanan.findUniqueOrThrow.mockResolvedValue({
      nama: "Artikel",
      tipeHitung: "PER_LEMBAR",
    });
    db.tarif.findUnique.mockResolvedValue({ hargaPerUnit: 4000 });
    db.tarif.upsert.mockResolvedValue({ id: "rate" });
    const result = await admin.saveTarif(
      form({ layananId: "artikel", kelompok: "SAINTEK", hargaPerUnit: 4500 }),
    );
    expect(result.ok).toBe(true);
    expect(db.riwayatHarga.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        nilaiLama: 4000,
        nilaiBaru: 4500,
        diubahOleh: "test-admin",
      }),
    });
    expect(db.$transaction.mock.calls[0][1]).toEqual({
      isolationLevel: "Serializable",
    });
  });
  it.each([-1, 1.5, 2147483648, "not-money"])(
    "rejects invalid price %s",
    async (amount) => {
      expect(
        (
          await admin.saveTarif(
            form({ layananId: "x", kelompok: "SAINTEK", hargaPerUnit: amount }),
          )
        ).ok,
      ).toBe(false);
      expect(db.$transaction).not.toHaveBeenCalled();
    },
  );
  it("does not accept a benefit without exactly one owner", async () => {
    expect(
      (
        await admin.saveBenefit(
          form({ teks: "Benefit", layananId: "x", paketId: "y" }),
        )
      ).ok,
    ).toBe(false);
    expect(db.benefit.create).not.toHaveBeenCalled();
  });
  it("blocks payment verification before proof submission", async () => {
    db.pembayaran.findUniqueOrThrow.mockResolvedValue({
      status: "MENUNGGU_PEMBAYARAN",
      pesanan: {},
    });
    expect(
      (await admin.verifyTurnitinPayment(form({ pembayaranId: "pay" }))).ok,
    ).toBe(false);
    expect(db.pembayaran.update).not.toHaveBeenCalled();
  });
  it("soft deletes both the order and its payment", async () => {
    expect((await admin.softDeletePesanan(form({ id: "order" }))).ok).toBe(
      true,
    );
    expect(db.pesanan.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { deletedAt: expect.any(Date) } }),
    );
    expect(db.pembayaran.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { pesananId: "order" } }),
    );
  });
  it("rejects an unsafe FAQ button destination", async () => {
    expect(
      (
        await content.saveFaq(
          form({
            pertanyaan: "Bagaimana pesan?",
            jawaban: "Buka simulasi.",
            labelTombol: "Pesan",
            tujuanTombol: "javascript:alert(1)",
            urutan: 0,
            tampil: true,
          }),
        )
      ).ok,
    ).toBe(false);
    expect(db.faq.create).not.toHaveBeenCalled();
  });
  it("does not expose database messages to a caller", async () => {
    db.fakultas.create.mockRejectedValue(
      new Error("sensitive database connection details"),
    );
    const result = await admin.saveFakultas(
      form({ nama: "Teknik", kelompok: "SAINTEK", urutan: 1 }),
    );
    expect(result.ok).toBe(false);
    expect(JSON.stringify(result)).not.toContain("sensitive");
  });
});
