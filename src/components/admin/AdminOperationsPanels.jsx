"use client";

import { useState } from "react";
import { CheckCircle, ExternalLink, Trash2 } from "lucide-react";
import {
  rejectTurnitinPayment,
  savePengaturan,
  softDeletePesanan,
  updatePesananStatus,
  uploadTurnitinResultPdf,
  verifyTurnitinPayment,
} from "../../actions/admin";
import { hapusPortfolio, tambahPortfolio } from "../../actions/portfolio";
import { hapusUlasan, setujuiUlasan } from "../../actions/ulasan";
import { formatRupiah } from "../../lib/calculateEstimate";

export function RingkasanPanel({ data }) {
  const pesananBaru = data.pesanan.filter((p) => p.status === "BARU").length;
  const menungguVerifikasi = data.pembayaran.filter(
    (p) => p.status === "MENUNGGU_VERIFIKASI"
  ).length;
  const ulasanPending = data.ulasan.filter((u) => u.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="surface-card p-5">
          <div className="text-xs font-semibold text-[#526277]">Pesanan Baru</div>
          <div className="mt-1 text-3xl font-bold text-[#16324F]">{pesananBaru}</div>
        </div>
        <div className="surface-card p-5">
          <div className="text-xs font-semibold text-[#526277]">QRIS Menunggu Verifikasi</div>
          <div className="mt-1 text-3xl font-bold text-[#116471]">{menungguVerifikasi}</div>
        </div>
        <div className="surface-card p-5">
          <div className="text-xs font-semibold text-[#526277]">Ulasan Menunggu Moderasi</div>
          <div className="mt-1 text-3xl font-bold text-[#172B40]">{ulasanPending}</div>
        </div>
      </div>

      <div className="surface-card p-5">
        <h2 className="mb-3 text-base font-bold text-[#16324F]">Pesanan Terbaru</h2>
        {data.pesanan.length === 0 ? (
          <p className="text-sm text-[#526277]">Belum ada pesanan masuk dari simulasi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#DCE4EB] bg-[#F7F8FA] text-xs text-[#526277]">
                <tr>
                  <th className="px-3 py-2">Kode</th>
                  <th className="px-3 py-2">Pelanggan</th>
                  <th className="px-3 py-2">Layanan</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4EB]">
                {data.pesanan.slice(0, 8).map((p) => (
                  <tr key={p.id} className="hover:bg-[#F7F8FA]">
                    <td className="px-3 py-2 font-semibold text-[#172B40]">{p.kodePesanan}</td>
                    <td className="px-3 py-2 text-[#172B40]">{p.nama}</td>
                    <td className="px-3 py-2 text-[#526277]">{p.layanan?.nama}</td>
                    <td className="px-3 py-2 font-semibold text-[#16324F]">
                      {formatRupiah(p.total)}
                    </td>
                    <td className="px-3 py-2 text-xs font-bold text-[#116471]">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function PesananPanel({ pesanan, runAction }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = pesanan.filter((item) => {
    const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      item.nama.toLowerCase().includes(q) ||
      item.judul.toLowerCase().includes(q) ||
      item.kodePesanan.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="surface-card p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold text-[#16324F]">Daftar Pesanan</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            aria-label="Cari pesanan"
            placeholder="Cari kode, nama, atau judul"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="min-h-11 rounded-lg border border-[#B6C4D1] bg-white px-3 text-sm text-[#172B40] placeholder:text-[#526277] outline-none focus:border-[#167D8D] focus:ring-2 focus:ring-[#167D8D]/20"
          />
          <select
            aria-label="Filter status pesanan"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="min-h-11 rounded-lg border border-[#B6C4D1] bg-white px-3 text-sm text-[#172B40] outline-none focus:border-[#167D8D]"
          >
            <option value="ALL">Semua Status</option>
            <option value="BARU">BARU</option>
            <option value="DIPROSES">DIPROSES</option>
            <option value="SELESAI">SELESAI</option>
            <option value="DIBATALKAN">DIBATALKAN</option>
            <option value="MENUNGGU_PEMBAYARAN">MENUNGGU_PEMBAYARAN</option>
            <option value="MENUNGGU_VERIFIKASI">MENUNGGU_VERIFIKASI</option>
            <option value="DIBAYAR">DIBAYAR</option>
          </select>
        </div>
      </div>

      {paged.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#526277]">Tidak ada pesanan yang cocok.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#DCE4EB] bg-[#F7F8FA] text-xs text-[#526277]">
              <tr>
                <th className="px-3 py-2">Kode & Pelanggan</th>
                <th className="px-3 py-2">Layanan & Rincian</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EB]">
              {paged.map((item) => (
                <tr key={item.id} className="hover:bg-[#F7F8FA]">
                  <td className="px-3 py-2.5">
                    <div className="font-bold text-[#172B40]">{item.kodePesanan}</div>
                    <div className="text-xs text-[#526277]">
                      {item.nama} ({item.fakultas?.nama})
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-[#172B40]">{item.layanan?.nama}</div>
                    <div className="max-w-xs truncate text-xs text-[#526277]">{item.judul}</div>
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-[#16324F]">
                    {formatRupiah(item.total)}
                  </td>
                  <td className="px-3 py-2.5">
                    <form
                      onSubmit={(e) => runAction(e, updatePesananStatus, "Status pesanan diperbarui.")}
                      className="flex items-center gap-1.5"
                    >
                      <input type="hidden" name="id" value={item.id} />
                      <select
                        aria-label={`Status pesanan ${item.kodePesanan}`}
                        name="status"
                        defaultValue={item.status}
                        className="min-h-10 rounded-lg border border-[#B6C4D1] bg-white px-2 text-xs text-[#172B40] outline-none focus:border-[#167D8D]"
                      >
                        <option value="BARU">BARU</option>
                        <option value="DIPROSES">DIPROSES</option>
                        <option value="SELESAI">SELESAI</option>
                        <option value="DIBATALKAN">DIBATALKAN</option>
                      </select>
                      <button
                        type="submit"
                        className="min-h-10 rounded-lg border border-[#167D8D] px-2.5 text-xs font-bold text-[#116471] hover:bg-[#E8F4F6]"
                      >
                        Simpan
                      </button>
                    </form>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <form onSubmit={(e) => runAction(e, softDeletePesanan, "Pesanan dihapus.")}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        aria-label={`Hapus pesanan ${item.kodePesanan}`}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#8F1D14] hover:bg-[#FEF3F2]"
                      >
                        <Trash2 aria-hidden="true" size={16} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs text-[#526277]">
          <span>
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="min-h-10 rounded-lg border border-[#DCE4EB] px-3 font-semibold hover:bg-[#F7F8FA] disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="min-h-10 rounded-lg border border-[#DCE4EB] px-3 font-semibold hover:bg-[#F7F8FA] disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function PembayaranPanel({ pembayaran, runAction }) {
  return (
    <div className="surface-card p-5">
      <h2 className="mb-4 text-base font-bold text-[#16324F]">
        Verifikasi Pembayaran QRIS & Upload Hasil Turnitin
      </h2>
      {pembayaran.length === 0 ? (
        <p className="text-sm text-[#526277]">Belum ada transaksi Cek Turnitin.</p>
      ) : (
        <div className="space-y-4">
          {pembayaran.map((pay) => (
            <div
              key={pay.id}
              className="rounded-xl border border-[#DCE4EB] bg-[#F7F8FA] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-[#172B40]">
                    {pay.pesanan?.kodePesanan}
                  </span>
                  <span className="ml-2 text-sm text-[#526277]">
                    {pay.pesanan?.nama} - {formatRupiah(pay.nominal)}
                  </span>
                </div>
                <span className="rounded-full border border-[#16324F]/20 bg-white px-3 py-1 text-xs font-bold text-[#16324F]">
                  {pay.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                {pay.dokumenUrl && (
                  <a
                    href={pay.dokumenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#DCE4EB] bg-white px-3 font-semibold text-[#16324F] hover:bg-[#EDF2F7]"
                  >
                    <ExternalLink aria-hidden="true" size={14} />
                    <span>Unduh Dokumen ({pay.dokumenNama || "File"})</span>
                  </a>
                )}
                {pay.buktiPembayaranUrl && (
                  <a
                    href={pay.buktiPembayaranUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#167D8D] bg-white px-3 font-semibold text-[#116471] hover:bg-[#E8F4F6]"
                  >
                    <ExternalLink aria-hidden="true" size={14} />
                    <span>Lihat Bukti Bayar QRIS</span>
                  </a>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {pay.status === "MENUNGGU_VERIFIKASI" && (
                  <>
                    <form
                      onSubmit={(e) =>
                        runAction(e, verifyTurnitinPayment, "Pembayaran QRIS diverifikasi.")
                      }
                    >
                      <input type="hidden" name="pembayaranId" value={pay.id} />
                      <button
                        type="submit"
                        className="btn-primary px-4 text-xs"
                      >
                        Verifikasi Pembayaran
                      </button>
                    </form>
                    <form
                      onSubmit={(e) =>
                        runAction(e, rejectTurnitinPayment, "Pembayaran ditolak.")
                      }
                    >
                      <input type="hidden" name="pembayaranId" value={pay.id} />
                      <button
                        type="submit"
                        className="min-h-11 rounded-xl border border-[#B42318] bg-white px-4 text-xs font-bold text-[#8F1D14] hover:bg-[#FEF3F2]"
                      >
                        Tolak
                      </button>
                    </form>
                  </>
                )}

                {pay.status === "DIBAYAR" && (
                  <form
                    onSubmit={(e) =>
                      runAction(e, uploadTurnitinResultPdf, "Hasil PDF Turnitin diunggah.")
                    }
                    className="flex flex-wrap items-center gap-2"
                  >
                    <input type="hidden" name="pembayaranId" value={pay.id} />
                    <input
                      aria-label="Upload PDF hasil Turnitin"
                      name="hasilPdfFile"
                      type="file"
                      accept="application/pdf"
                      required
                      className="min-h-11 rounded-lg border border-[#B6C4D1] bg-white px-2 py-1.5 text-xs text-[#172B40]"
                    />
                    <button
                      type="submit"
                      className="btn-primary bg-[#116471] px-4 text-xs hover:bg-[#0E515C]"
                    >
                      Upload Hasil PDF
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function UlasanPortfolioPanel({ ulasan, portfolio, runAction }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="surface-card h-fit p-5 lg:col-span-4">
          <h2 className="text-base font-bold text-[#16324F]">Tambah Portofolio</h2>
          <form
            onSubmit={(e) => runAction(e, tambahPortfolio, "Portofolio berhasil diunggah.")}
            className="mt-4 space-y-3"
          >
            <div>
              <label htmlFor="prt-judul" className="mb-1 block text-xs font-semibold text-[#172B40]">
                Judul karya
              </label>
              <input
                id="prt-judul"
                name="judul"
                type="text"
                required
                className="field-input"
              />
            </div>
            <div>
              <label htmlFor="prt-kat" className="mb-1 block text-xs font-semibold text-[#172B40]">
                Kategori
              </label>
              <select
                id="prt-kat"
                name="kategori"
                className="field-input"
              >
                <option value="UMUM">UMUM</option>
                <option value="KHUSUS">KHUSUS</option>
                <option value="PKL">PKL</option>
              </select>
            </div>
            <div>
              <label htmlFor="prt-file" className="mb-1 block text-xs font-semibold text-[#172B40]">
                Gambar (Maks 4 MB)
              </label>
              <input
                id="prt-file"
                name="imageFile"
                type="file"
                accept="image/*"
                required
                className="min-h-11 w-full rounded-lg border border-[#B6C4D1] bg-white px-2 py-1.5 text-xs text-[#172B40]"
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Upload & Simpan
            </button>
          </form>
        </div>

        <div className="surface-card p-5 lg:col-span-8">
          <h2 className="mb-4 text-base font-bold text-[#16324F]">Daftar Portofolio</h2>
          {portfolio.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#526277]">
              Belum ada portofolio yang diunggah.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#DCE4EB] bg-[#F7F8FA] p-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      width={48}
                      height={48}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                    <div className="overflow-hidden">
                      <div className="truncate text-sm font-bold text-[#172B40]">{item.judul}</div>
                      <div className="text-xs font-medium text-[#116471]">{item.kategori}</div>
                    </div>
                  </div>
                  <form onSubmit={(e) => runAction(e, hapusPortfolio, "Portofolio dihapus.")}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      aria-label={`Hapus ${item.judul}`}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#8F1D14] hover:bg-[#FEF3F2]"
                    >
                      <Trash2 aria-hidden="true" size={16} />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="surface-card p-5">
        <h2 className="mb-4 text-base font-bold text-[#16324F]">Moderasi Ulasan</h2>
        {ulasan.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#526277]">
            Belum ada ulasan masuk dari pengunjung.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#DCE4EB] bg-[#F7F8FA] text-xs text-[#526277]">
                <tr>
                  <th className="px-3 py-2">Pengirim</th>
                  <th className="px-3 py-2">Ulasan</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4EB]">
                {ulasan.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F7F8FA]">
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-[#172B40]">{u.nama}</div>
                      <div className="text-xs text-[#526277]">{u.role}</div>
                    </td>
                    <td className="max-w-md px-3 py-2.5 text-xs text-[#526277]">&ldquo;{u.teks}&rdquo;</td>
                    <td className="px-3 py-2.5 text-xs font-bold text-[#116471]">{u.status}</td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="inline-flex gap-1">
                        {u.status === "PENDING" && (
                          <form onSubmit={(e) => runAction(e, setujuiUlasan, "Ulasan disetujui.")}>
                            <input type="hidden" name="id" value={u.id} />
                            <button
                              type="submit"
                              aria-label={`Setujui ulasan ${u.nama}`}
                              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#116471] hover:bg-[#E8F4F6]"
                            >
                              <CheckCircle aria-hidden="true" size={16} />
                            </button>
                          </form>
                        )}
                        <form onSubmit={(e) => runAction(e, hapusUlasan, "Ulasan dihapus.")}>
                          <input type="hidden" name="id" value={u.id} />
                          <button
                            type="submit"
                            aria-label={`Hapus ulasan ${u.nama}`}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#8F1D14] hover:bg-[#FEF3F2]"
                          >
                            <Trash2 aria-hidden="true" size={16} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function PengaturanPanel({ pengaturan, runAction }) {
  return (
    <div className="surface-card p-6">
      <h2 className="text-base font-bold text-[#16324F]">Pengaturan Umum, WhatsApp & QRIS</h2>
      <form
        onSubmit={(e) => runAction(e, savePengaturan, "Pengaturan berhasil disimpan.")}
        className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <div>
          <label htmlFor="set-wa" className="mb-1 block text-xs font-semibold text-[#172B40]">
            Nomor WhatsApp Admin (format 628...)
          </label>
          <input
            id="set-wa"
            name="nomorWhatsApp"
            type="text"
            required
            defaultValue={pengaturan?.nomorWhatsApp || "6283151195556"}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="set-rek" className="mb-1 block text-xs font-semibold text-[#172B40]">
            Nama Rekening QRIS SeaBank
          </label>
          <input
            id="set-rek"
            name="namaRekening"
            type="text"
            defaultValue={pengaturan?.namaRekening || ""}
            placeholder="Contoh: Studio Tugasmu / Budi"
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="set-ig" className="mb-1 block text-xs font-semibold text-[#172B40]">
            URL Instagram
          </label>
          <input
            id="set-ig"
            name="instagramUrl"
            type="url"
            defaultValue={pengaturan?.instagramUrl || "https://www.instagram.com/studiotugasmu19/"}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="set-email" className="mb-1 block text-xs font-semibold text-[#172B40]">
            Email Kontak
          </label>
          <input
            id="set-email"
            name="emailKontak"
            type="email"
            defaultValue={pengaturan?.emailKontak || "halo@studiotugasmu.com"}
            className="field-input"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="set-qris" className="mb-1 block text-xs font-semibold text-[#172B40]">
            Unggah Gambar QRIS SeaBank (Opsional, Maks 4 MB)
          </label>
          <input
            id="set-qris"
            name="qrisFile"
            type="file"
            accept="image/*"
            className="min-h-11 w-full rounded-lg border border-[#B6C4D1] bg-white px-3 py-2 text-xs text-[#172B40] outline-none focus:border-[#167D8D]"
          />
          {pengaturan?.qrisImageUrl && (
            <p className="mt-1 text-xs font-medium text-[#116471]">
              Gambar QRIS saat ini sudah tersimpan. Unggah file baru untuk menggantinya.
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="set-terms" className="mb-1 block text-xs font-semibold text-[#172B40]">
            Syarat dan Ketentuan (Terms of Service)
          </label>
          <textarea
            id="set-terms"
            name="syaratKetentuan"
            rows={4}
            defaultValue={pengaturan?.syaratKetentuan || ""}
            className="field-input resize-y"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="set-privacy" className="mb-1 block text-xs font-semibold text-[#172B40]">
            Kebijakan Privasi (Privacy Policy)
          </label>
          <textarea
            id="set-privacy"
            name="kebijakanPrivasi"
            rows={4}
            defaultValue={pengaturan?.kebijakanPrivasi || ""}
            className="field-input resize-y"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="btn-primary px-6"
          >
            Simpan Pengaturan
          </button>
        </div>
      </form>
    </div>
  );
}
