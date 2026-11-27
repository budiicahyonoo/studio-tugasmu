"use client";

import { useState } from "react";
import { FileDown, Search, Upload } from "lucide-react";
import {
  checkTurnitinOrderStatus,
  createTurnitinOrder,
  submitTurnitinPaymentProof,
} from "../../actions/turnitin";
import { formatRupiah } from "../../lib/calculateEstimate";
import { useToast } from "../shared/ToastProvider";

const STATUS_BADGE = {
  MENUNGGU_PEMBAYARAN: "border-[#B6C4D1] bg-[#F7F8FA] text-[#526277]",
  MENUNGGU_VERIFIKASI: "border-[#167D8D] bg-[#E8F4F6] text-[#116471]",
  DIBAYAR: "border-[#16324F] bg-[#E8EEF4] text-[#16324F]",
  SELESAI: "border-[#16324F] bg-[#E8EEF4] text-[#16324F]",
  KEDALUWARSA: "border-[#B42318] bg-[#FEF3F2] text-[#8F1D14]",
  DIBATALKAN: "border-[#B42318] bg-[#FEF3F2] text-[#8F1D14]",
};

export default function TurnitinClient({
  fakultasList = [],
  qrisImageUrl = null,
  namaRekening = null,
  nomorWhatsApp = "6283151195556",
}) {
  const { showToast } = useToast();
  const [activeOrder, setActiveOrder] = useState(null);
  const [lookupCode, setLookupCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsCreating(true);

    try {
      const res = await createTurnitinOrder(new FormData(form));
      if (!res.ok) {
        showToast(res.error || "Gagal membuat pesanan Turnitin.", "error");
        return;
      }
      setActiveOrder({
        kodePesanan: res.kodePesanan,
        nominal: res.nominal,
        status: "MENUNGGU_PEMBAYARAN",
        kedaluwarsaPada: res.kedaluwarsaPada,
      });
      setLookupCode(res.kodePesanan);
      form.reset();
      showToast(`Pesanan ${res.kodePesanan} dibuat. Silakan bayar via QRIS.`, "success");
    } catch {
      showToast("Gagal mengunggah dokumen Turnitin.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUploadProof = async (e) => {
    e.preventDefault();
    if (!activeOrder?.kodePesanan) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("kodePesanan", activeOrder.kodePesanan);

    setIsUploadingProof(true);
    try {
      const res = await submitTurnitinPaymentProof(formData);
      if (!res.ok) {
        showToast(res.error || "Gagal mengunggah bukti pembayaran.", "error");
        return;
      }

      setActiveOrder((prev) => ({ ...prev, status: "MENUNGGU_VERIFIKASI" }));
      form.reset();
      showToast("Bukti pembayaran diterima. Menunggu verifikasi admin.", "success");

      const waNum = String(res.nomorWhatsApp || nomorWhatsApp).replace(/[^0-9]/g, "");
      const waMsg = `Halo Admin Studio Tugasmu, saya sudah membayar Cek Turnitin via QRIS.\nKode Pesanan: ${res.kodePesanan}\nMohon diverifikasi.`;
      window.open(
        `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`,
        "_blank",
        "noopener,noreferrer"
      );
    } catch {
      showToast("Terjadi kesalahan saat mengunggah bukti.", "error");
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupCode.trim()) return;
    setIsChecking(true);
    try {
      const res = await checkTurnitinOrderStatus(lookupCode);
      if (!res.ok) {
        showToast(res.error || "Kode pesanan tidak ditemukan.", "error");
        return;
      }
      setActiveOrder(res.order);
    } catch {
      showToast("Gagal memeriksa status pesanan.", "error");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-6">
        <div className="surface-card p-6">
          <h2 className="text-lg font-bold text-[#16324F]">1. Unggah Dokumen Turnitin</h2>
          <p className="mt-1 text-sm text-[#526277]">
            Format PDF, DOC, atau DOCX maksimal 4 MB. Biaya cek Rp15.000 per dokumen via QRIS.
          </p>

          <form onSubmit={handleCreateOrder} className="mt-5 space-y-4">
            <div>
              <label htmlFor="trn-nama" className="mb-1.5 block text-sm font-semibold text-[#172B40]">
                Nama lengkap
              </label>
              <input
                id="trn-nama"
                name="nama"
                type="text"
                required
                placeholder="Nama kamu"
                className="field-input"
              />
            </div>

            <div>
              <label htmlFor="trn-fakultas" className="mb-1.5 block text-sm font-semibold text-[#172B40]">
                Fakultas
              </label>
              <select
                id="trn-fakultas"
                name="fakultasId"
                required
                className="field-input"
              >
                {fakultasList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="trn-judul" className="mb-1.5 block text-sm font-semibold text-[#172B40]">
                Judul dokumen
              </label>
              <input
                id="trn-judul"
                name="judul"
                type="text"
                required
                placeholder="Judul makalah atau skripsi"
                className="field-input"
              />
            </div>

            <div>
              <label htmlFor="trn-file" className="mb-1.5 block text-sm font-semibold text-[#172B40]">
                File dokumen (PDF / DOCX)
              </label>
              <input
                id="trn-file"
                name="dokumenFile"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                required
                className="min-h-11 w-full rounded-lg border border-[#B6C4D1] bg-white px-3 py-2 text-sm text-[#172B40] file:mr-3 file:rounded-md file:border-0 file:bg-[#E8F4F6] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#116471]"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating || fakultasList.length === 0}
              className="btn-primary w-full py-3"
            >
              <Upload aria-hidden="true" size={17} />
              <span>{isCreating ? "Mengunggah dokumen..." : "Lanjut ke Pembayaran QRIS"}</span>
            </button>
          </form>
        </div>

        <div className="surface-card p-6">
          <h2 className="text-lg font-bold text-[#16324F]">Cek Status & Unduh Hasil PDF</h2>
          <form onSubmit={handleLookup} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <label htmlFor="lookup-code" className="sr-only">
              Kode pesanan Turnitin
            </label>
            <input
              id="lookup-code"
              type="text"
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value)}
              placeholder="Masukkan kode pesanan (mis. TRN-...)"
              className="field-input flex-1"
            />
            <button
              type="submit"
              disabled={isChecking}
              className="btn-secondary shrink-0 bg-[#E8F4F6]"
            >
              <Search aria-hidden="true" size={16} />
              <span>{isChecking ? "Mencari..." : "Cek"}</span>
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-6">
        <div className="surface-card p-6">
          <h2 className="border-b border-[#DCE4EB] pb-4 text-lg font-bold text-[#16324F]">
            2. Pembayaran QRIS & Status Pesanan
          </h2>

          {!activeOrder ? (
            <p className="mt-4 text-sm leading-relaxed text-[#526277]">
              Unggah dokumen di formulir sebelah kiri atau masukkan kode pesanan untuk melihat
              instruksi pembayaran QRIS dan hasil PDF.
            </p>
          ) : (
            <div className="mt-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-[#526277]">Kode Pesanan</div>
                  <div className="text-lg font-bold text-[#16324F]">{activeOrder.kodePesanan}</div>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${
                    STATUS_BADGE[activeOrder.status] || STATUS_BADGE.MENUNGGU_PEMBAYARAN
                  }`}
                >
                  {activeOrder.status}
                </span>
              </div>

              <div className="rounded-xl border border-[#DCE4EB] bg-[#F7F8FA] p-4">
                <div className="text-xs text-[#526277]">Nominal Pembayaran</div>
                <div className="mt-1 text-2xl font-bold text-[#16324F]">
                  {formatRupiah(activeOrder.nominal)}
                </div>
                {namaRekening && (
                  <div className="mt-1 text-xs text-[#526277]">
                    Rekening tujuan: <span className="font-semibold text-[#172B40]">{namaRekening}</span>
                  </div>
                )}
              </div>

              {activeOrder.status === "MENUNGGU_PEMBAYARAN" && (
                <>
                  {qrisImageUrl ? (
                    <div className="rounded-xl border border-[#DCE4EB] p-4 text-center">
                      <img
                        src={qrisImageUrl}
                        width={260}
                        height={260}
                        alt="Kode QRIS SeaBank Studio Tugasmu"
                        className="mx-auto h-56 w-56 rounded-lg object-contain"
                      />
                      <p className="mt-2 text-xs text-[#526277]">
                        Pindai kode QRIS di atas melalui aplikasi bank atau e-wallet Anda.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#DCE4EB] bg-[#F7F8FA] p-4 text-sm text-[#526277]">
                      Gambar QRIS belum diunggah oleh admin di pengaturan. Hubungi WhatsApp admin
                      dengan menyertakan kode pesanan <span className="font-bold">{activeOrder.kodePesanan}</span>.
                    </div>
                  )}

                  <form onSubmit={handleUploadProof} className="space-y-3 border-t border-[#DCE4EB] pt-4">
                    <label htmlFor="bukti-file" className="block text-sm font-semibold text-[#172B40]">
                      Unggah Bukti Pembayaran QRIS
                    </label>
                    <input
                      id="bukti-file"
                      name="buktiFile"
                      type="file"
                      accept="image/*,application/pdf"
                      required
                      className="min-h-11 w-full rounded-lg border border-[#B6C4D1] bg-white px-3 py-2 text-sm text-[#172B40] file:mr-3 file:rounded-md file:border-0 file:bg-[#E8F4F6] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#116471]"
                    />
                    <button
                      type="submit"
                      disabled={isUploadingProof}
                      className="btn-primary w-full py-3"
                    >
                      {isUploadingProof
                        ? "Mengirim bukti..."
                        : "Konfirmasi Pembayaran & Kabari Admin"}
                    </button>
                  </form>
                </>
              )}

              {activeOrder.status === "MENUNGGU_VERIFIKASI" && (
                <div className="rounded-xl border border-[#167D8D]/30 bg-[#E8F4F6] p-4 text-sm text-[#172B40]">
                  Bukti pembayaran sedang dicocokkan oleh admin dengan mutasi rekening SeaBank.
                  Silakan cek kembali halaman ini secara berkala dengan kode pesanan Anda.
                </div>
              )}

              {(activeOrder.status === "DIBAYAR" || activeOrder.status === "SELESAI") && (
                <div className="rounded-xl border border-[#16324F]/20 bg-[#E8EEF4] p-4 text-sm text-[#172B40]">
                  {activeOrder.hasilPdfUrl ? (
                    <div className="space-y-3">
                      <p className="font-semibold">Hasil pengecekan Turnitin sudah tersedia.</p>
                      <a
                        href={activeOrder.hasilPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex bg-[#116471] hover:bg-[#0E515C]"
                      >
                        <FileDown aria-hidden="true" size={17} />
                        <span>Unduh Hasil PDF Turnitin</span>
                      </a>
                    </div>
                  ) : (
                    <p>
                      Pembayaran telah diverifikasi. Dokumen Anda sedang diproses untuk pengecekan
                      Turnitin dan hasil PDF akan muncul di sini.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
