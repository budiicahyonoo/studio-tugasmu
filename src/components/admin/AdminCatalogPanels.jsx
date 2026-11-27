"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import {
  deleteBenefit,
  deleteFakultas,
  deleteLayanan,
  deletePaket,
  moveBenefit,
  saveBenefit,
  saveFakultas,
  saveLayanan,
  savePaket,
  saveTarif,
} from "../../actions/admin";
import { formatRupiah } from "../../lib/calculateEstimate";

export function LayananPanel({ layanan, runAction }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="surface-card h-fit p-5 lg:col-span-4">
        <h2 className="text-base font-bold text-[#16324F]">Tambah Layanan</h2>
        <form
          onSubmit={(e) => runAction(e, saveLayanan, "Layanan berhasil disimpan.")}
          className="mt-4 space-y-3"
        >
          <div>
            <label htmlFor="lay-nama" className="mb-1 block text-xs font-semibold text-[#172B40]">
              Nama layanan
            </label>
            <input
              id="lay-nama"
              name="nama"
              type="text"
              required
              placeholder="Contoh: Makalah"
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="lay-kat" className="mb-1 block text-xs font-semibold text-[#172B40]">
              Kategori
            </label>
            <select
              id="lay-kat"
              name="kategori"
              className="field-input"
            >
              <option value="UMUM">UMUM</option>
              <option value="KHUSUS">KHUSUS</option>
              <option value="PKL">PKL</option>
            </select>
          </div>
          <div>
            <label htmlFor="lay-tipe" className="mb-1 block text-xs font-semibold text-[#172B40]">
              Tipe hitungan
            </label>
            <select
              id="lay-tipe"
              name="tipeHitung"
              className="field-input"
            >
              <option value="PER_LEMBAR">PER_LEMBAR</option>
              <option value="PER_SLIDE">PER_SLIDE</option>
              <option value="PER_PAKET">PER_PAKET</option>
            </select>
          </div>
          <div>
            <label htmlFor="lay-est" className="mb-1 block text-xs font-semibold text-[#172B40]">
              Estimasi selesai
            </label>
            <input
              id="lay-est"
              name="estimasiSelesai"
              type="text"
              defaultValue="1x24 jam"
              required
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="lay-desc" className="mb-1 block text-xs font-semibold text-[#172B40]">
              Deskripsi singkat
            </label>
            <textarea
              id="lay-desc"
              name="deskripsi"
              rows={2}
              className="field-input resize-y"
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
          >
            Simpan Layanan
          </button>
        </form>
      </div>

      <div className="surface-card p-5 lg:col-span-8">
        <h2 className="mb-4 text-base font-bold text-[#16324F]">Daftar Layanan</h2>
        {layanan.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#526277]">
            Belum ada layanan terdaftar. Tambahkan layanan baru di formulir sebelah kiri.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#DCE4EB] bg-[#F7F8FA] text-xs text-[#526277]">
                <tr>
                  <th className="px-3 py-2.5">Layanan</th>
                  <th className="px-3 py-2.5">Kategori</th>
                  <th className="px-3 py-2.5">Tipe</th>
                  <th className="px-3 py-2.5">Estimasi</th>
                  <th className="px-3 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4EB]">
                {layanan.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7F8FA]">
                    <td className="px-3 py-2.5 font-semibold text-[#172B40]">{item.nama}</td>
                    <td className="px-3 py-2.5 text-xs font-medium text-[#116471]">{item.kategori}</td>
                    <td className="px-3 py-2.5 text-xs text-[#526277]">{item.tipeHitung}</td>
                    <td className="px-3 py-2.5 text-xs text-[#526277]">{item.estimasiSelesai}</td>
                    <td className="px-3 py-2.5 text-right">
                      <form
                        onSubmit={(e) => runAction(e, deleteLayanan, "Layanan dihapus/dinonaktifkan.")}
                        className="inline"
                      >
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          aria-label={`Hapus ${item.nama}`}
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
      </div>
    </div>
  );
}

export function TarifPanel({ layanan, riwayatHarga, runAction }) {
  const unitLayanan = layanan.filter((l) => l.tipeHitung !== "PER_PAKET");

  return (
    <div className="space-y-6">
      <div className="surface-card p-5">
        <h2 className="text-base font-bold text-[#16324F]">Tarif Per Lembar & Per Slide</h2>
        <p className="mt-1 text-xs text-[#526277]">
          Setiap perubahan tarif langsung berlaku pada simulasi dan tercatat di riwayat harga.
        </p>

        {unitLayanan.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#526277]">
            Belum ada layanan dengan tipe hitungan per lembar atau per slide.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#DCE4EB] bg-[#F7F8FA] text-xs text-[#526277]">
                <tr>
                  <th className="px-3 py-2.5">Layanan</th>
                  <th className="px-3 py-2.5">Kelompok</th>
                  <th className="px-3 py-2.5">Tarif (Rp)</th>
                  <th className="px-3 py-2.5 text-right">Simpan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4EB]">
                {unitLayanan.flatMap((l) =>
                  ["SOSHUM", "SAINTEK"].map((kelompok) => {
                    const current = l.tarif?.find((t) => t.kelompok === kelompok);
                    return (
                      <tr key={`${l.id}-${kelompok}`} className="hover:bg-[#F7F8FA]">
                        <td className="px-3 py-2.5 font-medium text-[#172B40]">
                          {l.nama} ({l.tipeHitung === "PER_SLIDE" ? "slide" : "lembar"})
                        </td>
                        <td className="px-3 py-2.5 text-xs font-semibold text-[#116471]">
                          {kelompok}
                        </td>
                        <td className="px-3 py-2.5" colSpan={2}>
                          <form
                            onSubmit={(e) => runAction(e, saveTarif, "Tarif diperbarui.")}
                            className="flex items-center justify-end gap-2"
                          >
                            <input type="hidden" name="layananId" value={l.id} />
                            <input type="hidden" name="kelompok" value={kelompok} />
                            <input
                              aria-label={`Tarif ${l.nama} ${kelompok}`}
                              name="hargaPerUnit"
                              type="number"
                              min={0}
                              required
                              defaultValue={current?.hargaPerUnit ?? 0}
                              className="field-input w-32 px-3 py-2"
                            />
                            <button
                              type="submit"
                              className="btn-primary px-4 text-xs"
                            >
                              Simpan
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="surface-card p-5">
        <h2 className="mb-3 text-base font-bold text-[#16324F]">Riwayat Perubahan Harga</h2>
        {riwayatHarga.length === 0 ? (
          <p className="text-sm text-[#526277]">Belum ada perubahan harga yang tercatat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#DCE4EB] bg-[#F7F8FA] text-[#526277]">
                <tr>
                  <th className="px-3 py-2">Entitas</th>
                  <th className="px-3 py-2">Keterangan</th>
                  <th className="px-3 py-2">Lama</th>
                  <th className="px-3 py-2">Baru</th>
                  <th className="px-3 py-2">Oleh</th>
                  <th className="px-3 py-2">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4EB]">
                {riwayatHarga.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F7F8FA]">
                    <td className="px-3 py-2 font-semibold text-[#172B40]">{r.entitas}</td>
                    <td className="px-3 py-2 text-[#526277]">{r.keterangan}</td>
                    <td className="px-3 py-2 text-[#526277]">{formatRupiah(r.nilaiLama)}</td>
                    <td className="px-3 py-2 font-semibold text-[#16324F]">
                      {formatRupiah(r.nilaiBaru)}
                    </td>
                    <td className="px-3 py-2 text-[#526277]">{r.diubahOleh}</td>
                    <td className="px-3 py-2 text-[#526277]">
                      {new Date(r.waktu).toLocaleString("id-ID")}
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

export function PaketBenefitPanel({ layanan, runAction }) {
  const paketLayanan = layanan.filter((l) => l.tipeHitung === "PER_PAKET");
  const [selectedPaketId, setSelectedPaketId] = useState(
    paketLayanan[0]?.paket?.[0]?.id || ""
  );

  const allPakets = paketLayanan.flatMap((l) =>
    (l.paket || []).map((p) => ({ ...p, layananNama: l.nama }))
  );
  const activePaket = allPakets.find((p) => p.id === selectedPaketId) || allPakets[0] || null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="surface-card h-fit p-5 lg:col-span-4">
          <h2 className="text-base font-bold text-[#16324F]">Tambah Paket</h2>
          <form
            onSubmit={(e) => runAction(e, savePaket, "Paket berhasil disimpan.")}
            className="mt-4 space-y-3"
          >
            <div>
              <label htmlFor="pkt-lay" className="mb-1 block text-xs font-semibold text-[#172B40]">
                Layanan
              </label>
              <select
                id="pkt-lay"
                name="layananId"
                className="field-input"
              >
                {paketLayanan.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pkt-kel" className="mb-1 block text-xs font-semibold text-[#172B40]">
                Kelompok
              </label>
              <select
                id="pkt-kel"
                name="kelompok"
                className="field-input"
              >
                <option value="SOSHUM">SOSHUM</option>
                <option value="SAINTEK">SAINTEK</option>
              </select>
            </div>
            <div>
              <label htmlFor="pkt-nama" className="mb-1 block text-xs font-semibold text-[#172B40]">
                Nama cakupan paket
              </label>
              <input
                id="pkt-nama"
                name="nama"
                type="text"
                required
                placeholder="Contoh: Sempro (Bab 1-3)"
                className="field-input"
              />
            </div>
            <div>
              <label htmlFor="pkt-harga" className="mb-1 block text-xs font-semibold text-[#172B40]">
                Harga tetap (Rp)
              </label>
              <input
                id="pkt-harga"
                name="harga"
                type="number"
                min={0}
                required
                className="field-input"
              />
            </div>
            <button
              type="submit"
              disabled={paketLayanan.length === 0}
              className="btn-primary w-full"
            >
              Simpan Paket
            </button>
          </form>
        </div>

        <div className="surface-card p-5 lg:col-span-8">
          <h2 className="mb-4 text-base font-bold text-[#16324F]">Daftar Paket & Harga</h2>
          {allPakets.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#526277]">
              Belum ada paket yang dibuat.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#DCE4EB] bg-[#F7F8FA] text-xs text-[#526277]">
                  <tr>
                    <th className="px-3 py-2">Layanan & Paket</th>
                    <th className="px-3 py-2">Kelompok</th>
                    <th className="px-3 py-2">Harga (Rp)</th>
                    <th className="px-3 py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE4EB]">
                  {allPakets.map((pkt) => (
                    <tr key={pkt.id} className="hover:bg-[#F7F8FA]">
                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-[#172B40]">{pkt.layananNama}</div>
                        <div className="text-xs text-[#526277]">{pkt.nama}</div>
                      </td>
                      <td className="px-3 py-2.5 text-xs font-semibold text-[#116471]">
                        {pkt.kelompok}
                      </td>
                      <td className="px-3 py-2.5">
                        <form
                          onSubmit={(e) => runAction(e, savePaket, "Harga paket diperbarui.")}
                          className="flex items-center gap-2"
                        >
                          <input type="hidden" name="id" value={pkt.id} />
                          <input type="hidden" name="layananId" value={pkt.layananId} />
                          <input type="hidden" name="kelompok" value={pkt.kelompok} />
                          <input type="hidden" name="nama" value={pkt.nama} />
                          <input
                            aria-label={`Harga ${pkt.layananNama} ${pkt.nama}`}
                            name="harga"
                            type="number"
                            min={0}
                            defaultValue={pkt.harga}
                            className="field-input w-32 px-2.5 py-2"
                          />
                          <button
                            type="submit"
                            className="btn-secondary px-3 text-xs"
                          >
                            Ubah
                          </button>
                        </form>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedPaketId(pkt.id)}
                            className="min-h-11 rounded-lg bg-[#E8F4F6] px-3 text-xs font-semibold text-[#116471] hover:bg-[#D5ECEF]"
                          >
                            Benefit ({pkt.benefit?.length || 0})
                          </button>
                          <form
                            onSubmit={(e) => runAction(e, deletePaket, "Paket dihapus.")}
                            className="inline"
                          >
                            <input type="hidden" name="id" value={pkt.id} />
                            <button
                              type="submit"
                              aria-label={`Hapus paket ${pkt.nama}`}
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

      {activePaket && (
        <div className="surface-card p-5">
          <h2 className="text-base font-bold text-[#16324F]">
            Kelola Benefit: {activePaket.layananNama} - {activePaket.nama} ({activePaket.kelompok})
          </h2>
          <form
            onSubmit={(e) => runAction(e, saveBenefit, "Benefit ditambahkan.")}
            className="mt-3 flex flex-col gap-2 sm:flex-row"
          >
            <input type="hidden" name="paketId" value={activePaket.id} />
            <label htmlFor="new-benefit-text" className="sr-only">
              Teks benefit baru
            </label>
            <input
              id="new-benefit-text"
              name="teks"
              type="text"
              required
              placeholder="Tulis benefit baru untuk paket ini"
              className="field-input flex-1"
            />
            <button
              type="submit"
              className="btn-primary shrink-0"
            >
              Tambah Benefit
            </button>
          </form>

          {(activePaket.benefit || []).length === 0 ? (
            <p className="mt-4 text-sm text-[#526277]">Belum ada benefit untuk paket ini.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[#DCE4EB]">
              {(activePaket.benefit || []).map((b, index) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-sm text-[#172B40]">
                    {index + 1}. {b.teks}
                  </span>
                  <div className="flex items-center gap-1">
                    <form onSubmit={(e) => runAction(e, moveBenefit, "Urutan benefit diperbarui.")}>
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button
                        type="submit"
                        aria-label="Naikkan urutan"
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#DCE4EB] hover:bg-[#F7F8FA]"
                      >
                        <ArrowUp aria-hidden="true" size={15} />
                      </button>
                    </form>
                    <form onSubmit={(e) => runAction(e, moveBenefit, "Urutan benefit diperbarui.")}>
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        type="submit"
                        aria-label="Turunkan urutan"
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[#DCE4EB] hover:bg-[#F7F8FA]"
                      >
                        <ArrowDown aria-hidden="true" size={15} />
                      </button>
                    </form>
                    <form onSubmit={(e) => runAction(e, deleteBenefit, "Benefit dihapus.")}>
                      <input type="hidden" name="id" value={b.id} />
                      <button
                        type="submit"
                        aria-label="Hapus benefit"
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#8F1D14] hover:bg-[#FEF3F2]"
                      >
                        <Trash2 aria-hidden="true" size={15} />
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function FakultasPanel({ fakultas, runAction }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="surface-card h-fit p-5 lg:col-span-4">
        <h2 className="text-base font-bold text-[#16324F]">Tambah Fakultas</h2>
        <form
          onSubmit={(e) => runAction(e, saveFakultas, "Fakultas berhasil disimpan.")}
          className="mt-4 space-y-3"
        >
          <div>
            <label htmlFor="fak-nama" className="mb-1 block text-xs font-semibold text-[#172B40]">
              Nama fakultas / rumpun
            </label>
            <input
              id="fak-nama"
              name="nama"
              type="text"
              required
              placeholder="Contoh: Arsitektur"
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="fak-kel" className="mb-1 block text-xs font-semibold text-[#172B40]">
              Kelompok tarif
            </label>
            <select
              id="fak-kel"
              name="kelompok"
              className="field-input"
            >
              <option value="SAINTEK">SAINTEK</option>
              <option value="SOSHUM">SOSHUM</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
          >
            Simpan Fakultas
          </button>
        </form>
      </div>

      <div className="surface-card p-5 lg:col-span-8">
        <h2 className="mb-4 text-base font-bold text-[#16324F]">Daftar Fakultas</h2>
        {fakultas.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#526277]">
            Belum ada fakultas terdaftar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#DCE4EB] bg-[#F7F8FA] text-xs text-[#526277]">
                <tr>
                  <th className="px-3 py-2">Nama Fakultas</th>
                  <th className="px-3 py-2">Kelompok</th>
                  <th className="px-3 py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4EB]">
                {fakultas.map((f) => (
                  <tr key={f.id} className="hover:bg-[#F7F8FA]">
                    <td className="px-3 py-2 font-medium text-[#172B40]">{f.nama}</td>
                    <td className="px-3 py-2">
                      <form
                        onSubmit={(e) => runAction(e, saveFakultas, "Kelompok fakultas diubah.")}
                        className="inline-flex items-center gap-2"
                      >
                        <input type="hidden" name="id" value={f.id} />
                        <input type="hidden" name="nama" value={f.nama} />
                        <input type="hidden" name="urutan" value={f.urutan} />
                        <select
                          aria-label={`Kelompok ${f.nama}`}
                          name="kelompok"
                          defaultValue={f.kelompok}
                          className="min-h-10 rounded-lg border border-[#B6C4D1] bg-white px-2 text-xs outline-none focus:border-[#167D8D]"
                        >
                          <option value="SAINTEK">SAINTEK</option>
                          <option value="SOSHUM">SOSHUM</option>
                        </select>
                        <button
                          type="submit"
                          className="min-h-10 rounded-lg border border-[#167D8D] px-2.5 text-xs font-bold text-[#116471] hover:bg-[#E8F4F6]"
                        >
                          Simpan
                        </button>
                      </form>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <form
                        onSubmit={(e) => runAction(e, deleteFakultas, "Fakultas dihapus/dinonaktifkan.")}
                        className="inline"
                      >
                        <input type="hidden" name="id" value={f.id} />
                        <button
                          type="submit"
                          aria-label={`Hapus ${f.nama}`}
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
      </div>
    </div>
  );
}
