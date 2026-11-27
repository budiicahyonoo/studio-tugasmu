import { describe, expect, it } from "vitest";
import {
  calculateEstimate,
  formatRupiah,
  buildWhatsAppOrderMessage,
} from "./calculateEstimate";

describe("calculateEstimate", () => {
  it("calculates PER_LEMBAR totals for Soshum and Saintek", () => {
    expect(
      calculateEstimate({
        tipeHitung: "PER_LEMBAR",
        hargaPerUnit: 3000,
        jumlah: 15,
      })
    ).toBe(45000);

    expect(
      calculateEstimate({
        tipeHitung: "PER_LEMBAR",
        hargaPerUnit: 4000,
        jumlah: 15,
      })
    ).toBe(60000);
  });

  it("calculates PER_SLIDE totals", () => {
    expect(
      calculateEstimate({
        tipeHitung: "PER_SLIDE",
        hargaPerUnit: 3000,
        jumlah: 20,
      })
    ).toBe(60000);
  });

  it("uses fixed total price for PER_PAKET", () => {
    expect(
      calculateEstimate({
        tipeHitung: "PER_PAKET",
        paketHarga: 2000000,
      })
    ).toBe(2000000);

    expect(
      calculateEstimate({
        tipeHitung: "PER_PAKET",
        paketHarga: 5000000,
      })
    ).toBe(5000000);
  });

  it("rejects invalid quantities and unknown calculation types", () => {
    expect(() =>
      calculateEstimate({
        tipeHitung: "PER_LEMBAR",
        hargaPerUnit: 3000,
        jumlah: 0,
      })
    ).toThrow("Jumlah lembar minimal 1.");

    expect(() =>
      calculateEstimate({
        tipeHitung: "PER_SLIDE",
        hargaPerUnit: 3000,
        jumlah: 0,
      })
    ).toThrow("Jumlah slide minimal 1.");

    expect(() =>
      calculateEstimate({
        tipeHitung: "TIDAK_DIKENAL",
      })
    ).toThrow("Tipe hitungan tidak dikenal");
  });

  it("formats Rupiah and builds WhatsApp order message", () => {
    expect(formatRupiah(45000)).toBe("Rp45.000");

    const message = buildWhatsAppOrderMessage({
      kodePesanan: "TM19-20261126-ABCD",
      nama: "Budi",
      fakultasNama: "Hukum",
      kelompok: "SOSHUM",
      layananNama: "Artikel",
      tipeHitung: "PER_LEMBAR",
      jumlah: 15,
      judul: "Analisis Hukum Perdata",
      deskripsi: "Ringkasan materi perkuliahan.",
      total: 45000,
      estimasiSelesai: "1x24 jam",
    });

    expect(message).toContain("TM19-20261126-ABCD");
    expect(message).toContain("Hukum (SOSHUM)");
    expect(message).toContain("Jumlah: 15 lembar");
    expect(message).toContain("Rp45.000");
    expect(message).toContain("1x24 jam");
  });
});
