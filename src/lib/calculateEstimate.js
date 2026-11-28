/** @param {{tipeHitung: string, hargaPerUnit?: number|string, jumlah?: number|string, paketHarga?: number|string}} input */
export function calculateEstimate({
  tipeHitung,
  hargaPerUnit,
  jumlah,
  paketHarga,
}) {
  if (tipeHitung === "PER_LEMBAR" || tipeHitung === "PER_SLIDE") {
    const unitPrice = Number(hargaPerUnit);
    const qty = Number(jumlah);

    if (!Number.isInteger(unitPrice) || unitPrice < 0) {
      throw new Error("Tarif per unit tidak valid.");
    }
    if (!Number.isInteger(qty) || qty < 1) {
      throw new Error(
        tipeHitung === "PER_SLIDE"
          ? "Jumlah slide minimal 1."
          : "Jumlah lembar minimal 1.",
      );
    }

    const total = unitPrice * qty;
    if (!Number.isSafeInteger(total) || total > 2147483647) {
      throw new Error("Total melebihi batas Rupiah yang dapat disimpan.");
    }
    return total;
  }

  if (tipeHitung === "PER_PAKET") {
    const fixedPrice = Number(paketHarga);
    if (
      !Number.isInteger(fixedPrice) ||
      fixedPrice < 0 ||
      fixedPrice > 2147483647
    ) {
      throw new Error("Harga paket tidak valid.");
    }
    return fixedPrice;
  }

  throw new Error(`Tipe hitungan tidak dikenal: ${tipeHitung}`);
}

/** @param {number|string} amount */
export function formatRupiah(amount) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return "Rp0";
  return `Rp${Math.round(numeric).toLocaleString("id-ID")}`;
}

/** @param {{kodePesanan?: string|null, nama: string, fakultasNama: string, kelompok: string, layananNama: string, paketNama?: string|null, paketDeskripsi?: string|null, tipeHitung: string, jumlah?: number|null, judul: string, deskripsi: string, total: number, estimasiSelesai: string}} order */
export function buildWhatsAppOrderMessage({
  kodePesanan,
  nama,
  fakultasNama,
  kelompok,
  layananNama,
  paketNama,
  paketDeskripsi,
  tipeHitung,
  jumlah,
  judul,
  deskripsi,
  total,
  estimasiSelesai,
}) {
  const rincianUnit =
    tipeHitung === "PER_PAKET"
      ? `Paket: ${paketNama || "-"}`
      : tipeHitung === "PER_SLIDE"
        ? `Jumlah: ${jumlah} slide`
        : `Jumlah: ${jumlah} lembar`;

  const lines = [
    "Halo Admin Studio Tugasmu,",
    "Saya menyetujui hasil simulasi pesanan berikut:",
    "",
    kodePesanan ? `Kode Pesanan: ${kodePesanan}` : null,
    `Nama: ${nama}`,
    `Fakultas: ${fakultasNama} (${kelompok})`,
    `Layanan: ${layananNama}`,
    rincianUnit,
    paketDeskripsi ? `Cakupan paket: ${paketDeskripsi}` : null,
    `Judul Tugas: ${judul}`,
    `Deskripsi: ${deskripsi}`,
    `Total Harga: ${formatRupiah(total)}`,
    `Estimasi Selesai: ${estimasiSelesai}`,
    "",
    "Mohon konfirmasi untuk melanjutkan pengerjaan. Terima kasih.",
  ].filter((line) => line !== null);

  return lines.join("\n");
}
