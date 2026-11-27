"use client";
import Link from "next/link";
import {
  rejectTurnitinPayment,
  savePengaturan,
  softDeletePesanan,
  updatePesananStatus,
  uploadTurnitinResultPdf,
  verifyTurnitinPayment,
} from "../../actions/admin";
import { Field, visibilityOptions } from "./AdminForms";
import { formatRupiah } from "../../lib/calculateEstimate";
export function RingkasanPanel({ data }) {
  return (
    <div className="space-y-6">
      <dl className="grid gap-4 sm:grid-cols-3">
        {[
          ["Pesanan baru", data.stats.baru],
          ["Pembayaran menunggu verifikasi", data.stats.verifikasi],
          ["Foto ulasan tampil", data.stats.galeri],
        ].map(([label, count]) => (
          <div key={label} className="surface-card p-5">
            <dt className="text-sm text-[#526277]">{label}</dt>
            <dd className="mt-2 text-3xl font-bold text-[#16324F]">{count}</dd>
          </div>
        ))}
      </dl>
      <section className="surface-card p-5">
        <h2 className="text-xl font-bold">Pesanan terbaru</h2>
        {!data.recent.length ? (
          <p className="empty-state mt-4">Belum ada pesanan.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[#DCE4EB]">
            {data.recent.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap justify-between gap-3 py-4 text-sm"
              >
                <div>
                  <p className="font-bold break-all">{order.kodePesanan}</p>
                  <p className="mt-1 text-[#526277]">
                    {order.nama} · {order.layanan.nama}
                  </p>
                </div>
                <p>
                  {order.status} · {formatRupiah(order.total)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
export function Pagination({ page, pages, tab, q = "", status = "" }) {
  const href = (number) =>
    `/admin/dashboard?${new URLSearchParams({ tab, page: String(number), q, status })}`;
  return (
    <nav
      aria-label="Halaman daftar"
      className="mt-5 flex flex-wrap items-center gap-3"
    >
      {page > 1 && (
        <Link className="btn-secondary" href={href(page - 1)}>
          Sebelumnya
        </Link>
      )}
      <p className="text-sm">
        Halaman {page} dari {pages}
      </p>
      {page < pages && (
        <Link className="btn-secondary" href={href(page + 1)}>
          Berikutnya
        </Link>
      )}
    </nav>
  );
}
export function PesananPanel({ pesanan, paging, runAction }) {
  return (
    <section className="space-y-5">
      <form
        method="get"
        action="/admin/dashboard"
        className="surface-card grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto]"
      >
        <input type="hidden" name="tab" value="pesanan" />
        <Field
          name="q"
          label="Cari nama, kode, atau judul"
          type="search"
          defaultValue={paging.q}
          maxLength={100}
        />
        <Field
          name="status"
          label="Status pesanan"
          defaultValue={paging.status}
          options={[
            { value: "", label: "Semua status" },
            ...[
              "BARU",
              "DIPROSES",
              "SELESAI",
              "DIBATALKAN",
              "MENUNGGU_PEMBAYARAN",
              "MENUNGGU_VERIFIKASI",
              "DIBAYAR",
              "KEDALUWARSA",
            ].map((value) => ({ value, label: value })),
          ]}
        />
        <button type="submit" className="btn-primary self-end">
          Cari pesanan
        </button>
      </form>
      <p className="text-sm text-[#526277]">{paging.total} pesanan ditemukan</p>
      {!pesanan.length ? (
        <p className="empty-state">Tidak ada pesanan yang cocok.</p>
      ) : (
        pesanan.map((order) => (
          <details key={order.id} className="surface-card p-5">
            <summary className="min-h-11 text-sm font-bold break-words">
              {order.kodePesanan} · {order.nama} · {order.status}
            </summary>
            <div className="mt-4 space-y-3 text-sm leading-7">
              <p>
                {order.layanan.nama} ·{" "}
                {order.ringkasan?.fakultasNama || order.fakultas.nama} ·{" "}
                {order.jenjang}
              </p>
              <p className="font-bold">{order.judul}</p>
              <p className="whitespace-pre-wrap break-words">
                {order.deskripsiAsli}
              </p>
              {order.deskripsiAI && (
                <div>
                  <h3 className="font-bold">Deskripsi rapi yang disetujui</h3>
                  <p className="whitespace-pre-wrap">{order.deskripsiAI}</p>
                </div>
              )}
              <p>
                {order.ringkasan?.paketNama ||
                  (order.jumlah
                    ? `${order.jumlah} unit`
                    : order.paket?.nama)}{" "}
                · {formatRupiah(order.total)}
              </p>
              <p>
                Estimasi saat pemesanan:{" "}
                {order.ringkasan?.estimasiSelesai ||
                  "Tidak tercatat pada pesanan lama"}
              </p>
              <form
                onSubmit={(event) =>
                  runAction(event, updatePesananStatus, "Status diperbarui.")
                }
                className="grid gap-3 sm:grid-cols-2"
              >
                <input type="hidden" name="id" value={order.id} />
                <Field
                  name="status"
                  label="Status"
                  defaultValue={order.status}
                  options={["BARU", "DIPROSES", "SELESAI", "DIBATALKAN"].map(
                    (value) => ({ value, label: value }),
                  )}
                />
                <Field
                  name="catatanAdmin"
                  label="Catatan admin"
                  type="textarea"
                  defaultValue={order.catatanAdmin || ""}
                  maxLength={2000}
                />
                <button type="submit" className="btn-secondary">
                  Simpan status
                </button>
              </form>
              <form
                onSubmit={(event) =>
                  runAction(event, softDeletePesanan, "Pesanan diarsipkan.")
                }
              >
                <input type="hidden" name="id" value={order.id} />
                <button type="submit" className="btn-danger">
                  Arsipkan pesanan
                </button>
              </form>
            </div>
          </details>
        ))
      )}
      <Pagination {...paging} tab="pesanan" />
    </section>
  );
}
export function PembayaranPanel({ pembayaran, paging, runAction }) {
  return (
    <section className="space-y-5">
      <p className="rounded-xl bg-[#FEF6E7] p-4 text-sm leading-7">
        Cocokkan bukti dengan mutasi rekening sebelum verifikasi. Sistem tidak
        mengakses akun Turnitin atau memproses pembayaran secara otomatis.
      </p>
      {!pembayaran.length ? (
        <p className="empty-state">Belum ada pembayaran.</p>
      ) : (
        pembayaran.map((payment) => (
          <article key={payment.id} className="surface-card space-y-4 p-5">
            <h2 className="text-lg font-bold break-words">
              {payment.pesanan.kodePesanan}
            </h2>
            <p className="text-sm">
              {payment.pesanan.nama} · {formatRupiah(payment.nominal)} ·{" "}
              {payment.status}
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                ["dokumen", payment.dokumenPublicId, "Unduh dokumen"],
                ["bukti", payment.buktiPublicId, "Lihat bukti"],
                ["hasil", payment.hasilPublicId, "Unduh hasil"],
              ].map(
                ([kind, exists, label]) =>
                  exists && (
                    <a
                      key={kind}
                      className="btn-secondary"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`/api/files?payment=${payment.id}&kind=${kind}`}
                    >
                      {label}
                    </a>
                  ),
              )}
            </div>
            {payment.status === "MENUNGGU_VERIFIKASI" && (
              <div className="flex flex-wrap gap-3">
                {[
                  [verifyTurnitinPayment, "Verifikasi pembayaran"],
                  [rejectTurnitinPayment, "Tolak pembayaran"],
                ].map(([action, label]) => (
                  <form
                    key={label}
                    onSubmit={(event) =>
                      runAction(event, action, "Pembayaran diperbarui.")
                    }
                  >
                    <input
                      type="hidden"
                      name="pembayaranId"
                      value={payment.id}
                    />
                    <button type="submit" className="btn-secondary">
                      {label}
                    </button>
                  </form>
                ))}
              </div>
            )}
            {payment.status === "DIBAYAR" && (
              <form
                onSubmit={(event) =>
                  runAction(
                    event,
                    uploadTurnitinResultPdf,
                    "Hasil PDF tersimpan.",
                  )
                }
                className="space-y-3"
              >
                <input type="hidden" name="pembayaranId" value={payment.id} />
                <Field
                  name="hasilPdfFile"
                  label="Hasil Turnitin (PDF, maksimal 4 MB)"
                  type="file"
                  accept="application/pdf"
                  required
                />
                <button type="submit" className="btn-primary">
                  Unggah hasil PDF
                </button>
              </form>
            )}
          </article>
        ))
      )}
      <Pagination {...paging} tab="pembayaran" />
    </section>
  );
}
export function PengaturanPanel({ pengaturan, runAction }) {
  const settings = pengaturan || {};
  return (
    <form
      onSubmit={(event) =>
        runAction(event, savePengaturan, "Pengaturan tersimpan.")
      }
      className="surface-card grid gap-5 p-5 sm:grid-cols-2"
    >
      <Field
        name="nomorWhatsApp"
        label="WhatsApp admin (628...)"
        defaultValue={settings.nomorWhatsApp || ""}
        required
        pattern="62[0-9]{7,13}"
      />
      <Field
        name="jumlahKlienDibantu"
        label="Jumlah klien dibantu (kosongkan untuk sembunyikan)"
        type="number"
        min={0}
        max={2147483647}
        defaultValue={settings.jumlahKlienDibantu ?? ""}
      />
      <Field
        name="instagramUrl"
        label="URL Instagram"
        type="url"
        defaultValue={settings.instagramUrl || ""}
        required
      />
      <Field
        name="emailKontak"
        label="Email kontak"
        type="email"
        defaultValue={settings.emailKontak || ""}
        required
      />
      <Field
        name="calendlyUrl"
        label="URL Calendly (opsional)"
        type="url"
        defaultValue={settings.calendlyUrl || ""}
      />
      <Field
        name="namaRekening"
        label="Nama rekening / merchant QRIS"
        defaultValue={settings.namaRekening || ""}
        maxLength={120}
      />
      <div className="sm:col-span-2">
        <Field
          name="qrisFile"
          label="Gambar QRIS (JPG/PNG/WebP, maksimal 4 MB)"
          type="file"
          accept="image/jpeg,image/png,image/webp"
        />
        {settings.qrisImageUrl && (
          <p className="mt-2 text-sm text-[#116471]">
            Gambar QRIS sudah tersimpan.
          </p>
        )}
      </div>
      <div className="sm:col-span-2 rounded-xl bg-[#FEF6E7] p-4 text-sm leading-7">
        Aktifkan Turnitin hanya setelah izin layanan dan QRIS dikonfirmasi serta
        paket diberi harga di menu Paket. Format dokumen PDF. Batas ukuran
        berikut dipakai pada form dan penjelasan publik.
      </div>
      <Field
        name="turnitinAktif"
        label="Aktifkan pemesanan Turnitin"
        options={visibilityOptions}
        defaultValue={String(settings.turnitinAktif ?? false)}
      />
      <Field
        name="turnitinMaksMb"
        label="Ukuran maksimal dokumen (MB)"
        type="number"
        min={1}
        max={4}
        defaultValue={settings.turnitinMaksMb || 4}
        required
      />
      <Field
        name="turnitinBatasJam"
        label="Batas pembayaran (jam)"
        type="number"
        min={1}
        max={168}
        defaultValue={settings.turnitinBatasJam || 24}
        required
      />
      <div className="sm:col-span-2">
        <Field
          name="syaratKetentuan"
          label="Syarat dan ketentuan"
          type="textarea"
          rows={8}
          maxLength={30000}
          defaultValue={settings.syaratKetentuan || ""}
        />
      </div>
      <div className="sm:col-span-2">
        <Field
          name="kebijakanPrivasi"
          label="Kebijakan privasi"
          type="textarea"
          rows={8}
          maxLength={30000}
          defaultValue={settings.kebijakanPrivasi || ""}
        />
      </div>
      <button type="submit" className="btn-primary">
        Simpan pengaturan
      </button>
    </form>
  );
}
