import { describe, expect, it } from "vitest";
import { resolveQuote } from "./quote";
import { faqSchema, safeDestination } from "./validation";
const service = {
  id: "artikel",
  nama: "Artikel",
  aktif: true,
  tipeHitung: "PER_LEMBAR",
  estimasiSelesai: "1x24 jam",
  tarif: [
    { kelompok: "SOSHUM", hargaPerUnit: 3000 },
    { kelompok: "SAINTEK", hargaPerUnit: 4000 },
  ],
  paket: [],
  benefit: [],
};
const faculty = (kelompok) => ({
  id: kelompok,
  nama: kelompok,
  kelompok,
  aktif: true,
});
describe("PRD price and selection rules", () => {
  it("changes the total from 45000 to 60000 when faculty changes", () => {
    expect(
      resolveQuote({
        layanan: service,
        fakultas: faculty("SOSHUM"),
        jumlah: 15,
      }).total,
    ).toBe(45000);
    expect(
      resolveQuote({
        layanan: service,
        fakultas: faculty("SAINTEK"),
        jumlah: 15,
      }).total,
    ).toBe(60000);
  });
  it("uses Soshum pricing for a school pupil", () =>
    expect(
      resolveQuote({
        layanan: service,
        fakultas: faculty("SAINTEK"),
        jenjang: "SISWA",
        jumlah: 15,
      }).total,
    ).toBe(45000));
  it("rejects disabled services and faculties", () => {
    expect(() =>
      resolveQuote({
        layanan: { ...service, aktif: false },
        fakultas: faculty("SOSHUM"),
        jumlah: 1,
      }),
    ).toThrow();
    expect(() =>
      resolveQuote({
        layanan: service,
        fakultas: { ...faculty("SOSHUM"), aktif: false },
        jumlah: 1,
      }),
    ).toThrow();
  });
  it("does not accept another group's package or add Sempro to Full", () => {
    const layanan = {
      ...service,
      tipeHitung: "PER_PAKET",
      paket: [
        {
          id: "sempro",
          nama: "Sempro",
          kelompok: "SOSHUM",
          harga: 2000000,
          benefit: [{ id: "b1", teks: "Bab 1-3" }],
        },
        {
          id: "full",
          nama: "Full",
          kelompok: "SOSHUM",
          harga: 5000000,
          benefit: [{ id: "b2", teks: "Bab 1-5" }],
        },
      ],
    };
    const quote = resolveQuote({
      layanan,
      fakultas: faculty("SOSHUM"),
      paketId: "full",
    });
    expect(quote.total).toBe(5000000);
    expect(quote.benefit[0].teks).toBe("Bab 1-5");
    expect(() =>
      resolveQuote({ layanan, fakultas: faculty("SAINTEK"), paketId: "full" }),
    ).toThrow();
  });
  it("does not use a missing rate or client-supplied package for a unit service", () => {
    expect(() =>
      resolveQuote({
        layanan: { ...service, tarif: [] },
        fakultas: faculty("SAINTEK"),
        jumlah: 1,
      }),
    ).toThrow();
    expect(
      resolveQuote({
        layanan: service,
        fakultas: faculty("SOSHUM"),
        jumlah: 2,
        paketId: "unrelated",
      }).paketId,
    ).toBeNull();
  });
});
describe("FAQ destination validation", () => {
  it.each([
    "javascript:alert(1)",
    "//evil.example",
    "https://evil.example",
    "/admin/dashboard",
    "/missing",
    "/\\evil.example",
  ])("rejects %s", (value) => expect(safeDestination(value)).toBe(false));
  it.each(["/simulasi", "/tarif?kategori=UMUM", "https://wa.me/628123456789"])(
    "allows %s",
    (value) => expect(safeDestination(value)).toBe(true),
  );
  it("requires both the button label and destination", () =>
    expect(
      faqSchema.safeParse({
        pertanyaan: "Bagaimana memesan?",
        jawaban: "Gunakan simulasi.",
        labelTombol: "Pesan",
        tujuanTombol: "",
        urutan: 0,
        tampil: true,
      }).success,
    ).toBe(false));
});
