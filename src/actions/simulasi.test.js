import { beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({
  fakultas: { findUnique: vi.fn() },
  layanan: { findUnique: vi.fn() },
  pengaturan: { findUnique: vi.fn() },
  pesanan: { upsert: vi.fn() },
}));
vi.mock("../lib/prisma", () => ({ prisma: db }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("../lib/persistentRateLimit", () => ({
  checkRateLimit: () => ({ allowed: true }),
}));
import { submitSimulasiOrder } from "./simulasi";
import { buildWhatsAppOrderMessage } from "../lib/calculateEstimate";
const input = {
  nama: "Pemesan uji",
  fakultasId: "hukum",
  layananId: "artikel",
  judul: "Topik pengujian",
  deskripsiAsli: "Susun artikel untuk latihan.",
  jumlah: 15,
  requestId: "1e9f5262-c987-4b05-85c0-cc371300c98a",
  quotedTotal: 45000,
};
beforeEach(() => {
  vi.resetAllMocks();
  db.fakultas.findUnique.mockResolvedValue({
    id: "hukum",
    nama: "Hukum",
    kelompok: "SOSHUM",
    aktif: true,
  });
  db.layanan.findUnique.mockResolvedValue({
    id: "artikel",
    nama: "Artikel",
    aktif: true,
    tipeHitung: "PER_LEMBAR",
    estimasiSelesai: "1x24 jam",
    tarif: [{ kelompok: "SOSHUM", hargaPerUnit: 3000 }],
    paket: [],
    benefit: [],
  });
  db.pengaturan.findUnique.mockResolvedValue({ nomorWhatsApp: "628123456789" });
  db.pesanan.upsert.mockImplementation(async (args) => args.create);
});
describe("simulation submission", () => {
  it("saves a server-calculated snapshot before preparing WhatsApp", async () => {
    const result = await submitSimulasiOrder(input);
    expect(result.ok).toBe(true);
    expect(result.total).toBe(45000);
    expect(result.kodePesanan).toMatch(/^ST-[A-F0-9]{20}$/);
    expect(db.pesanan.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { requestId: input.requestId },
        create: expect.objectContaining({
          total: 45000,
          jumlah: 15,
          paketId: null,
          ringkasan: expect.objectContaining({
            total: 45000,
            fakultasNama: "Hukum",
          }),
        }),
      }),
    );
    const message = buildWhatsAppOrderMessage({
      ...result,
      nama: input.nama,
      judul: input.judul,
      deskripsi: input.deskripsiAsli,
    });
    expect(message).toContain(result.kodePesanan);
    expect(message).toContain("Rp45.000");
    expect(message).toContain("15 lembar");
    expect(result.nomorWhatsApp).toBe("628123456789");
  });
  it("rejects a forged total rather than persisting it", async () => {
    const result = await submitSimulasiOrder({
      ...input,
      quotedTotal: 1,
      fallbackTotal: 1,
    });
    expect(result).toMatchObject({ ok: false, priceChanged: true });
    expect(db.pesanan.upsert).not.toHaveBeenCalled();
  });
  it("does not claim that an order was saved during database failure", async () => {
    db.pesanan.upsert.mockRejectedValue(new Error("database details"));
    const result = await submitSimulasiOrder(input);
    expect(result).toMatchObject({ ok: false, canContact: true });
    expect(result.kodePesanan).toBeUndefined();
    expect(JSON.stringify(result)).not.toContain("database details");
  });
  it("rejects malformed input and quantities over the limit", async () => {
    expect((await submitSimulasiOrder({ ...input, jumlah: 1001 })).ok).toBe(
      false,
    );
    expect((await submitSimulasiOrder({ ...input, requestId: "" })).ok).toBe(
      false,
    );
    expect(db.pesanan.upsert).not.toHaveBeenCalled();
  });
});
