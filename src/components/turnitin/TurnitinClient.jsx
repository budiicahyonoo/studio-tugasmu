"use client";
import { useRef, useState } from "react";
import {
  checkTurnitinOrderStatus,
  createTurnitinOrder,
  submitTurnitinPaymentProof,
} from "../../actions/turnitin";
import { formatRupiah } from "../../lib/calculateEstimate";
import { MessageCircle } from "lucide-react";
import { useToast } from "../shared/ToastProvider";
export default function TurnitinClient({ settings, packages = [] }) {
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState("");
  const [notification, setNotification] = useState("");
  const request = useRef("");
  async function track(code) {
    const result = await checkTurnitinOrderStatus(code);
    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }
    setOrder(result.order);
  }
  async function create(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    request.current ||= crypto.randomUUID();
    form.set("requestId", request.current);
    setBusy("create");
    try {
      const result = await createTurnitinOrder(form);
      if (!result.ok) {
        showToast(result.error, "error");
        return;
      }
      await track(result.kodePesanan);
      showToast(
        "Pesanan dibuat. Simpan kode pesanan untuk pelacakan.",
        "success",
      );
    } catch {
      showToast("Pesanan belum dapat dibuat.", "error");
    } finally {
      setBusy("");
    }
  }
  async function proof(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    form.set("kodePesanan", order.kodePesanan);
    const notificationWindow = window.open("about:blank", "_blank");
    setBusy("proof");
    try {
      const result = await submitTurnitinPaymentProof(form);
      if (!result.ok) {
        notificationWindow?.close();
        showToast(result.error, "error");
        await track(order.kodePesanan);
        return;
      }
      const link = `https://wa.me/${result.nomorWhatsApp}?text=${encodeURIComponent(`Halo Admin Studio Tugasmu, bukti pembayaran pesanan ${order.kodePesanan} sudah diunggah. Mohon verifikasi.`)}`;
      setNotification(link);
      await track(order.kodePesanan);
      showToast(
        "Bukti diterima. Kabari admin melalui tombol WhatsApp.",
        "success",
      );
      if (notificationWindow) notificationWindow.location.href = link;
    } catch {
      notificationWindow?.close();
      showToast("Bukti belum tersimpan. Coba lagi.", "error");
    } finally {
      setBusy("");
    }
  }
  async function search(event) {
    event.preventDefault();
    setBusy("track");
    try {
      await track(new FormData(event.currentTarget).get("kode"));
    } catch {
      showToast("Status belum dapat dimuat.", "error");
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="space-y-8">
      {!settings.turnitinAktif ? (
        <p className="rounded-xl border border-[#DCE4EB] bg-[#FEF6E7] p-5 text-sm leading-7">
          Segera hadir. Pemesanan dan pembayaran belum dibuka. Kode pesanan yang
          sudah kamu miliki tetap dapat dilacak.
        </p>
      ) : !packages.length ? (
        <p className="empty-state">
          Paket pengecekan belum diatur admin. Pemesanan belum tersedia.
        </p>
      ) : (
        <form onSubmit={create} className="surface-card p-5 sm:p-7">
          <fieldset
            disabled={Boolean(busy) || Boolean(order)}
            className="space-y-7"
          >
            <section>
              <h2 className="form-section-title">1. Pilih paket pengecekan</h2>
              <label
                htmlFor="turnitin-paket"
                className="mt-4 mb-2 block text-sm font-semibold"
              >
                Paket dan estimasi selesai
              </label>
              <select
                id="turnitin-paket"
                name="paketId"
                className="field-input"
                required
              >
                {packages.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama} · {formatRupiah(item.harga)} ·{" "}
                    {item.estimasiSelesai}
                  </option>
                ))}
              </select>
            </section>
            <section>
              <h2 className="form-section-title">2. Unggah dokumen PDF</h2>
              <label
                htmlFor="turnitin-file"
                className="mt-4 mb-2 block text-sm font-semibold"
              >
                Dokumen (PDF, maksimal {settings.turnitinMaksMb} MB)
              </label>
              <input
                id="turnitin-file"
                name="dokumenFile"
                type="file"
                accept={settings.turnitinFormat}
                required
                className="field-input"
              />
            </section>
            <section>
              <h2 className="form-section-title">3. Isi kontak pemesan</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="turnitin-nama"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Nama
                  </label>
                  <input
                    id="turnitin-nama"
                    name="nama"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    className="field-input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="turnitin-wa"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Nomor WhatsApp (628...)
                  </label>
                  <input
                    id="turnitin-wa"
                    name="nomorWhatsApp"
                    type="tel"
                    pattern="62[0-9]{7,13}"
                    required
                    autoComplete="tel"
                    className="field-input"
                  />
                </div>
              </div>
            </section>
            <section>
              <h2 className="form-section-title">
                4. Bayar QRIS dan unggah bukti
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#526277]">
                QRIS dan kode pesanan tampil setelah dokumen tersimpan.
                Pembayaran diverifikasi admin. Batas pembayaran{" "}
                {settings.turnitinBatasJam} jam.
              </p>
              <button type="submit" className="btn-primary mt-4">
                {busy === "create"
                  ? "Menyimpan dokumen..."
                  : "Buat pesanan dan lihat QRIS"}
              </button>
            </section>
          </fieldset>
        </form>
      )}
      <section className="surface-card p-5 sm:p-7">
        <h2 className="text-2xl font-bold text-[#16324F]">Lacak pesanan</h2>
        <p className="mt-3 text-sm leading-7 text-[#526277]">
          Kode pesanan adalah akses pribadi ke status dan hasil PDF. Simpan dan
          jangan bagikan kepada orang lain.
        </p>
        <form
          onSubmit={search}
          className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="min-w-0 flex-1">
            <label
              htmlFor="track-code"
              className="mb-2 block text-sm font-semibold"
            >
              Kode pesanan
            </label>
            <input
              id="track-code"
              name="kode"
              required
              maxLength={44}
              placeholder="TRN-..."
              className="field-input"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="btn-secondary"
            disabled={Boolean(busy)}
          >
            {busy === "track" ? "Memuat status..." : "Periksa status"}
          </button>
        </form>
        {order && (
          <div
            role="status"
            className="mt-6 space-y-4 border-t border-[#DCE4EB] pt-6 text-sm leading-7"
          >
            <p className="break-all font-bold">{order.kodePesanan}</p>
            <p>
              {order.paketNama} · {formatRupiah(order.nominal)}
            </p>
            {order.estimasiSelesai && (
              <p>Estimasi selesai: {order.estimasiSelesai}</p>
            )}
            <p>
              Status: <strong>{order.status.replaceAll("_", " ")}</strong>
            </p>
            {order.kedaluwarsaPada && (
              <p>
                Batas pembayaran:{" "}
                {new Date(order.kedaluwarsaPada).toLocaleString("id-ID")}
              </p>
            )}
            {order.status === "MENUNGGU_PEMBAYARAN" && (
              <div className="space-y-4">
                <p>Nama merchant: {order.namaRekening}</p>
                {order.qrisImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={order.qrisImageUrl}
                    width={280}
                    height={280}
                    alt="QRIS pembayaran pesanan Studio Tugasmu"
                    className="h-64 w-full object-contain"
                  />
                )}
                <form onSubmit={proof} className="space-y-4">
                  <label
                    htmlFor="turnitin-bukti"
                    className="block font-semibold"
                  >
                    Bukti pembayaran (JPG/PNG/WebP, maksimal 4 MB)
                  </label>
                  <input
                    id="turnitin-bukti"
                    type="file"
                    name="buktiFile"
                    accept="image/jpeg,image/png,image/webp"
                    required
                    className="field-input"
                  />
                  <button
                    type="submit"
                    disabled={Boolean(busy)}
                    className="btn-primary"
                  >
                    {busy === "proof"
                      ? "Mengunggah bukti..."
                      : "Kirim bukti untuk diverifikasi admin"}
                  </button>
                </form>
              </div>
            )}
            {order.status === "MENUNGGU_VERIFIKASI" && (
              <p>Admin sedang mencocokkan bukti dengan mutasi rekening.</p>
            )}
            {order.status === "DIBAYAR" && (
              <p>
                Pembayaran diverifikasi admin. Hasil PDF akan tampil setelah
                diunggah.
              </p>
            )}
            {order.status === "KEDALUWARSA" && (
              <p>Batas pembayaran telah habis. Pesanan ini tidak diproses.</p>
            )}
            {order.status === "DIBATALKAN" && (
              <p>
                Pembayaran ditolak atau pesanan dibatalkan. Hubungi admin untuk
                penjelasan.
              </p>
            )}
            {order.hasilPdfUrl && (
              <a
                href={order.hasilPdfUrl}
                className="btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Unduh hasil PDF
              </a>
            )}
            {notification && (
              <a
                href={notification}
                className="btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle aria-hidden="true" size={18} />
                Kabari admin lewat WhatsApp
              </a>
            )}
          </div>
        )}
      </section>
      <details className="border-y border-[#DCE4EB] py-3">
        <summary className="min-h-11 py-3 font-bold">
          Format dokumen dan proses pembayaran
        </summary>
        <p className="pb-4 text-sm leading-7">
          Dokumen harus PDF maksimal {settings.turnitinMaksMb} MB. Bukti
          pembayaran JPG, PNG, atau WebP maksimal 4 MB. Pembayaran diperiksa
          admin. Hasil pengecekan tersedia sebagai PDF setelah diunggah admin.
          Layanan hanya dibuka setelah akses dan izin operasional dikonfirmasi.
        </p>
      </details>
    </div>
  );
}
