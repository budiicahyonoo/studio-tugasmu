import { calculateEstimate } from "./calculateEstimate";
/** @param {import("./types").QuoteInput} input */
export function resolveQuote({
  layanan,
  fakultas,
  jenjang = "MAHASISWA",
  paketId,
  jumlah,
}) {
  if (!layanan?.aktif || !fakultas?.aktif || layanan.nama === "Cek Turnitin")
    throw new Error("Fakultas atau layanan tidak tersedia.");
  const kelompok = jenjang === "SISWA" ? "SOSHUM" : fakultas.kelompok;
  const paket =
    layanan.tipeHitung === "PER_PAKET"
      ? layanan.paket.find(
          (item) => item.id === paketId && item.kelompok === kelompok,
        )
      : null;
  const tarif = layanan.tarif.find((item) => item.kelompok === kelompok);
  if (layanan.tipeHitung === "PER_PAKET" && !paket)
    throw new Error("Paket tidak sesuai dengan kelompok tarif.");
  if (layanan.tipeHitung !== "PER_PAKET" && !tarif)
    throw new Error("Tarif belum tersedia.");
  const total = calculateEstimate({
    tipeHitung: layanan.tipeHitung,
    paketHarga: paket?.harga,
    hargaPerUnit: tarif?.hargaPerUnit,
    jumlah,
  });
  return {
    total,
    kelompok,
    paketId: paket?.id || null,
    paketNama: paket?.nama || null,
    jumlah: paket ? null : Number(jumlah),
    estimasiSelesai: layanan.estimasiSelesai,
    layananNama: layanan.nama,
    fakultasNama: fakultas.nama,
    tipeHitung: layanan.tipeHitung,
    benefit: paket?.benefit || layanan.benefit || [],
  };
}
