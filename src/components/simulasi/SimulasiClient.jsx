"use client";

import { useMemo, useState } from "react";
import { AlignLeft, CheckCircle2, FileDown, Send } from "lucide-react";
import { jsPDF } from "jspdf";
import {
  buildWhatsAppOrderMessage,
  calculateEstimate,
  formatRupiah,
} from "../../lib/calculateEstimate";
import { polishDescription } from "../../actions/ai";
import { submitSimulasiOrder } from "../../actions/simulasi";
import { useToast } from "../shared/ToastProvider";
import DatabaseUnavailable from "../shared/DatabaseUnavailable";

const KATEGORI_LABEL = {
  UMUM: "Umum",
  KHUSUS: "Khusus",
  PKL: "PKL",
};

export default function SimulasiClient({
  fakultasList = [],
  layananList = [],
  nomorWhatsApp = "6283151195556",
  initialLayananId = "",
  dataUnavailable = false,
}) {
  const { showToast } = useToast();

  const defaultFakultas = fakultasList[0]?.id || "";
  const defaultLayanan =
    layananList.find((l) => l.id === initialLayananId)?.id || layananList[0]?.id || "";

  const [nama, setNama] = useState("");
  const [fakultasId, setFakultasId] = useState(defaultFakultas);
  const [layananId, setLayananId] = useState(defaultLayanan);
  const [paketId, setPaketId] = useState("");
  const [jumlah, setJumlah] = useState(1);
  const [judul, setJudul] = useState("");
  const [deskripsiAsli, setDeskripsiAsli] = useState("");
  const [deskripsiAI, setDeskripsiAI] = useState("");
  const [useAiVersion, setUseAiVersion] = useState(false);

  const [isPolishing, setIsPolishing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasConfirmedCalc, setHasConfirmedCalc] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const selectedFakultas = useMemo(
    () => fakultasList.find((f) => f.id === fakultasId) || null,
    [fakultasList, fakultasId]
  );

  const selectedLayanan = useMemo(
    () => layananList.find((l) => l.id === layananId) || null,
    [layananList, layananId]
  );

  const availablePakets = useMemo(() => {
    if (!selectedLayanan || !selectedFakultas) return [];
    return (selectedLayanan.paket || []).filter(
      (p) => p.kelompok === selectedFakultas.kelompok
    );
  }, [selectedLayanan, selectedFakultas]);

  const activePaket = useMemo(() => {
    if (!availablePakets.length) return null;
    return availablePakets.find((p) => p.id === paketId) || availablePakets[0];
  }, [availablePakets, paketId]);

  const activeTarif = useMemo(() => {
    if (!selectedLayanan || !selectedFakultas) return null;
    return (
      (selectedLayanan.tarif || []).find((t) => t.kelompok === selectedFakultas.kelompok) ||
      null
    );
  }, [selectedLayanan, selectedFakultas]);

  const activeBenefits = useMemo(() => {
    if (!selectedLayanan) return [];
    if (selectedLayanan.tipeHitung === "PER_PAKET" && activePaket?.benefit?.length) {
      return activePaket.benefit;
    }
    return selectedLayanan.benefit || [];
  }, [selectedLayanan, activePaket]);

  const liveCalculation = useMemo(() => {
    if (!selectedLayanan || !selectedFakultas) {
      return { total: 0, error: "Pilih fakultas dan layanan." };
    }
    try {
      if (selectedLayanan.tipeHitung === "PER_PAKET") {
        if (!activePaket) {
          return { total: 0, error: "Paket untuk kelompok fakultas ini belum tersedia." };
        }
        return {
          total: calculateEstimate({
            tipeHitung: "PER_PAKET",
            paketHarga: activePaket.harga,
          }),
          error: null,
        };
      }

      if (!activeTarif) {
        return { total: 0, error: "Tarif untuk kelompok fakultas ini belum diatur admin." };
      }

      const qty = Number(jumlah);
      if (!Number.isInteger(qty) || qty < 1) {
        return { total: 0, error: "Jumlah minimal 1." };
      }

      return {
        total: calculateEstimate({
          tipeHitung: selectedLayanan.tipeHitung,
          hargaPerUnit: activeTarif.hargaPerUnit,
          jumlah: qty,
        }),
        error: null,
      };
    } catch (err) {
      return { total: 0, error: err.message };
    }
  }, [selectedLayanan, selectedFakultas, activePaket, activeTarif, jumlah]);

  if (dataUnavailable) {
    return <DatabaseUnavailable dataLabel="Data simulasi harga" />;
  }

  if (fakultasList.length === 0 || layananList.length === 0) {
    return (
      <div className="surface-card p-6 text-center text-sm text-[#526277]">
        Katalog layanan atau fakultas belum tersedia. Hubungi admin untuk melengkapi data.
      </div>
    );
  }

  const handlePolishAI = async () => {
    if (deskripsiAsli.trim().length < 5) {
      showToast("Tulis deskripsi tugas minimal 5 karakter sebelum dirapikan.", "error");
      return;
    }

    setIsPolishing(true);
    try {
      const res = await polishDescription({
        deskripsi: deskripsiAsli,
        layananNama: selectedLayanan?.nama,
      });

      if (res.ok && !res.usedFallback) {
        setDeskripsiAI(res.deskripsiRapih);
        setUseAiVersion(true);
        showToast("Deskripsi berhasil dirapikan. Kamu bisa meninjau atau mengubahnya.", "success");
      } else {
        showToast(res.message || "AI sedang sibuk. Deskripsi asli tetap dipakai.", "info");
      }
    } catch {
      showToast("Perapian AI gagal. Deskripsi asli tetap dipakai.", "info");
    } finally {
      setIsPolishing(false);
    }
  };

  const effectiveDescription =
    useAiVersion && deskripsiAI.trim() ? deskripsiAI.trim() : deskripsiAsli.trim();

  const handleHitungClick = (e) => {
    e.preventDefault();
    if (!nama.trim() || !judul.trim() || deskripsiAsli.trim().length < 5) {
      showToast("Lengkapi nama, judul tugas, dan deskripsi terlebih dahulu.", "error");
      return;
    }
    if (liveCalculation.error) {
      showToast(liveCalculation.error, "error");
      return;
    }
    setHasConfirmedCalc(true);
    showToast("Hasil simulasi siap ditinjau. Klik Setuju untuk mengirim ke WhatsApp.", "success");
  };

  const handleApproveAndSend = async () => {
    if (!nama.trim() || !judul.trim() || deskripsiAsli.trim().length < 5) {
      showToast("Lengkapi nama, judul tugas, dan deskripsi terlebih dahulu.", "error");
      return;
    }
    if (liveCalculation.error) {
      showToast(liveCalculation.error, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitSimulasiOrder({
        nama: nama.trim(),
        fakultasId: selectedFakultas.id,
        layananId: selectedLayanan.id,
        paketId: selectedLayanan.tipeHitung === "PER_PAKET" ? activePaket?.id : null,
        judul: judul.trim(),
        deskripsiAsli: deskripsiAsli.trim(),
        deskripsiAI: useAiVersion && deskripsiAI.trim() ? deskripsiAI.trim() : null,
        jumlah: selectedLayanan.tipeHitung === "PER_PAKET" ? null : Number(jumlah),
        fallbackTotal: liveCalculation.total,
        fallbackEstimasi: selectedLayanan.estimasiSelesai,
      });

      if (!result.ok) {
        showToast(result.error || "Gagal memproses pesanan.", "error");
        return;
      }

      const finalWaNumber = String(result.nomorWhatsApp || nomorWhatsApp).replace(/[^0-9]/g, "");
      const message = buildWhatsAppOrderMessage({
        kodePesanan: result.kodePesanan,
        nama: nama.trim(),
        fakultasNama: result.fakultasNama || selectedFakultas.nama,
        kelompok: result.kelompok || selectedFakultas.kelompok,
        layananNama: result.layananNama || selectedLayanan.nama,
        paketNama: result.paketNama || activePaket?.nama,
        tipeHitung: selectedLayanan.tipeHitung,
        jumlah: Number(jumlah),
        judul: judul.trim(),
        deskripsi: effectiveDescription,
        total: result.total || liveCalculation.total,
        estimasiSelesai: result.estimasiSelesai || selectedLayanan.estimasiSelesai,
      });

      const waUrl = `https://wa.me/${finalWaNumber}?text=${encodeURIComponent(message)}`;
      setLastOrder({
        kodePesanan: result.kodePesanan,
        total: result.total || liveCalculation.total,
        estimasiSelesai: result.estimasiSelesai || selectedLayanan.estimasiSelesai,
        waUrl,
      });

      if (result.dbSaved) {
        showToast(`Pesanan ${result.kodePesanan} tersimpan. Mengalihkan ke WhatsApp.`, "success");
      } else {
        showToast("Simulasi tetap dilanjutkan ke WhatsApp admin.", "info");
      }

      window.open(waUrl, "_blank", "noopener,noreferrer");
    } catch {
      showToast("Terjadi kendala saat mengirim pesanan. Coba lagi.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(22, 50, 79);
    doc.text("RINGKASAN SIMULASI HARGA - STUDIO TUGASMU", 20, 22);
    doc.setFontSize(11);
    doc.setTextColor(23, 43, 64);
    doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 20, 34);
    if (lastOrder?.kodePesanan) {
      doc.text(`Kode Pesanan: ${lastOrder.kodePesanan}`, 20, 42);
    }
    doc.text(`Nama: ${nama || "-"}`, 20, 52);
    doc.text(`Fakultas: ${selectedFakultas?.nama || "-"} (${selectedFakultas?.kelompok || "-"})`, 20, 60);
    doc.text(`Layanan: ${selectedLayanan?.nama || "-"}`, 20, 68);
    const detail =
      selectedLayanan?.tipeHitung === "PER_PAKET"
        ? `Paket: ${activePaket?.nama || "-"}`
        : `Jumlah: ${jumlah} ${selectedLayanan?.tipeHitung === "PER_SLIDE" ? "slide" : "lembar"}`;
    doc.text(detail, 20, 76);
    doc.text(`Judul: ${judul || "-"}`, 20, 84);
    doc.setFontSize(13);
    doc.text(`Total Harga: ${formatRupiah(liveCalculation.total)}`, 20, 98);
    doc.text(`Estimasi Selesai: ${selectedLayanan?.estimasiSelesai || "1x24 jam"}`, 20, 106);
    doc.save(`Simulasi_StudioTugasmu_${Date.now()}.pdf`);
  };

  const unitLabel = selectedLayanan?.tipeHitung === "PER_SLIDE" ? "slide" : "lembar";
  const saintekList = fakultasList.filter((f) => f.kelompok === "SAINTEK");
  const soshumList = fakultasList.filter((f) => f.kelompok === "SOSHUM");

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <form
        onSubmit={handleHitungClick}
        className="surface-card space-y-6 p-5 sm:p-7 lg:col-span-7"
      >
        <div className="border-b border-[#DCE4EB] pb-4">
          <h2 className="text-base font-bold text-[#16324F]">1. Data Pemesan & Fakultas</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="sim-nama" className="mb-1.5 block text-sm font-semibold text-[#172B40]">
                Nama lengkap
              </label>
              <input
                id="sim-nama"
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama kamu"
                className="field-input"
              />
            </div>

            <div>
              <label htmlFor="sim-fakultas" className="mb-1.5 block text-sm font-semibold text-[#172B40]">
                Fakultas / Rumpun
              </label>
              <select
                id="sim-fakultas"
                value={fakultasId}
                onChange={(e) => {
                  setFakultasId(e.target.value);
                  setPaketId("");
                }}
                className="field-input"
              >
                {soshumList.length > 0 && (
                  <optgroup label="Kelompok Soshum">
                    {soshumList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nama} (Soshum)
                      </option>
                    ))}
                  </optgroup>
                )}
                {saintekList.length > 0 && (
                  <optgroup label="Kelompok Saintek">
                    {saintekList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nama} (Saintek)
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4 border-b border-[#DCE4EB] pb-5">
          <h2 className="text-base font-bold text-[#16324F]">2. Layanan & Cakupan</h2>
          <div>
            <label htmlFor="sim-layanan" className="mb-1.5 block text-sm font-semibold text-[#172B40]">
              Jenis layanan
            </label>
            <select
              id="sim-layanan"
              value={layananId}
              onChange={(e) => {
                setLayananId(e.target.value);
                setPaketId("");
              }}
              className="field-input"
            >
              {["UMUM", "KHUSUS", "PKL"].map((kat) => {
                const items = layananList.filter((l) => l.kategori === kat);
                if (!items.length) return null;
                return (
                  <optgroup key={kat} label={`Kategori ${KATEGORI_LABEL[kat]}`}>
                    {items.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nama}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {selectedLayanan?.tipeHitung === "PER_PAKET" ? (
            <div>
              <span className="mb-2 block text-sm font-semibold text-[#172B40]">
                Pilih paket ({selectedFakultas?.kelompok === "SAINTEK" ? "Saintek" : "Soshum"})
              </span>
              {availablePakets.length === 0 ? (
                <p className="rounded-lg border border-[#B42318] bg-[#FEF3F2] p-3 text-sm text-[#8F1D14]">
                  Paket untuk kelompok fakultas ini belum tersedia.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {availablePakets.map((pkt) => {
                    const isSelected = activePaket?.id === pkt.id;
                    return (
                      <button
                        key={pkt.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setPaketId(pkt.id)}
                        className={`flex min-h-11 flex-col items-start rounded-xl border p-4 text-left transition-colors ${
                          isSelected
                            ? "border-[#167D8D] bg-[#E8F4F6]"
                            : "border-[#DCE4EB] bg-[#F7F8FA] hover:border-[#167D8D]/60"
                        }`}
                      >
                        <span className="text-sm font-bold text-[#16324F]">{pkt.nama}</span>
                        <span className="mt-1 text-base font-bold text-[#116471]">
                          {formatRupiah(pkt.harga)}
                        </span>
                        {pkt.deskripsi && (
                          <span className="mt-1 text-xs text-[#526277]">{pkt.deskripsi}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-[#DCE4EB] bg-[#F7F8FA] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="sim-jumlah" className="text-sm font-semibold text-[#172B40]">
                  Jumlah {unitLabel}
                </label>
                <div className="text-xs font-medium text-[#172B40]">
                  <span>
                    {activeTarif
                      ? `${formatRupiah(activeTarif.hargaPerUnit)} / ${unitLabel}`
                      : "Tarif belum diatur"}
                  </span>
                  <span className="mx-2 text-[#526277]">|</span>
                  <span className="font-semibold text-[#116471]">
                    Estimasi {selectedLayanan?.estimasiSelesai || "1x24 jam"}
                  </span>
                </div>
              </div>
              <input
                id="sim-jumlah"
                type="number"
                min={1}
                max={1000}
                required
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                className="field-input mt-2"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-bold text-[#16324F]">3. Judul & Instruksi Tugas</h2>
          <div>
            <label htmlFor="sim-judul" className="mb-1.5 block text-sm font-semibold text-[#172B40]">
              Judul atau topik tugas
            </label>
            <input
              id="sim-judul"
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Analisis Dampak Kebijakan Fiskal Daerah"
              className="field-input"
            />
          </div>

          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="sim-deskripsi" className="text-sm font-semibold text-[#172B40]">
                Deskripsi dan instruksi tugas
              </label>
              <button
                type="button"
                onClick={handlePolishAI}
                disabled={isPolishing}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[#167D8D] bg-[#E8F4F6] px-3.5 py-1.5 text-xs font-bold text-[#116471] transition-colors hover:bg-[#D5ECEF] disabled:opacity-60"
              >
                <AlignLeft aria-hidden="true" size={14} />
                <span>{isPolishing ? "Merapikan..." : "Rapikan dengan AI"}</span>
              </button>
            </div>
            <textarea
              id="sim-deskripsi"
              rows={4}
              required
              value={deskripsiAsli}
              onChange={(e) => setDeskripsiAsli(e.target.value)}
              placeholder="Tulis kebutuhan tugasmu secara bebas, misalnya format sitasi, referensi khusus, atau instruksi dosen."
              className="field-input resize-y"
            />
            <p className="mt-1.5 text-xs text-[#526277]">
              Perapian AI hanya merapikan tata bahasa dan poin instruksi, tidak mengubah harga atau jumlah {unitLabel}.
            </p>

            {deskripsiAI && (
              <div className="mt-3 rounded-xl border border-[#167D8D]/40 bg-[#E8F4F6] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#16324F]">
                    Hasil perapian AI
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUseAiVersion(true)}
                      className={`min-h-10 rounded-lg px-3 text-xs font-semibold ${
                        useAiVersion
                          ? "bg-[#16324F] text-white"
                          : "border border-[#16324F] bg-white text-[#16324F]"
                      }`}
                    >
                      Pakai versi rapi
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseAiVersion(false)}
                      className={`min-h-10 rounded-lg px-3 text-xs font-semibold ${
                        !useAiVersion
                          ? "bg-[#116471] text-white"
                          : "border border-[#DCE4EB] bg-white text-[#172B40]"
                      }`}
                    >
                      Pakai deskripsi asli
                    </button>
                  </div>
                </div>
                <textarea
                  aria-label="Edit hasil perapian AI"
                  rows={3}
                  value={deskripsiAI}
                  onChange={(e) => setDeskripsiAI(e.target.value)}
                  className="field-input mt-2"
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn-secondary w-full bg-[#E8F4F6] lg:hidden"
        >
          Hitung & Tinjau Ringkasan
        </button>
      </form>

      <aside className="lg:col-span-5">
        <div className="surface-card sticky top-24 overflow-hidden">
          <div className="border-b border-[#DCE4EB] bg-[#16324F] px-6 py-4 text-white">
            <h2 className="text-lg font-bold">Hasil Simulasi Harga</h2>
          </div>

          <div className="p-5 sm:p-6">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#526277]">Fakultas</dt>
                <dd className="text-right font-semibold text-[#172B40]">
                  {selectedFakultas?.nama} ({selectedFakultas?.kelompok})
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#526277]">Layanan</dt>
                <dd className="text-right font-semibold text-[#172B40]">
                  {selectedLayanan?.nama}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#526277]">Rincian</dt>
                <dd className="text-right font-semibold text-[#172B40]">
                  {selectedLayanan?.tipeHitung === "PER_PAKET"
                    ? activePaket?.nama || "-"
                    : `${jumlah || 0} ${unitLabel}`}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#526277]">Estimasi selesai</dt>
                <dd className="text-right">
                  <span className="rounded-md bg-[#F4B860] px-2.5 py-0.5 text-xs font-bold text-[#16324F]">
                    {selectedLayanan?.estimasiSelesai || "1x24 jam"}
                  </span>
                </dd>
              </div>
            </dl>

            <div className="mt-5 rounded-xl border border-[#DCE4EB] bg-[#F7F8FA] p-4">
              <div className="text-xs font-semibold text-[#526277]">Harga pasti</div>
              <div className="mt-1 text-3xl font-bold text-[#16324F]" aria-live="polite">
                {liveCalculation.error ? "-" : formatRupiah(liveCalculation.total)}
              </div>
              {liveCalculation.error && (
                <p className="mt-1 text-xs font-medium text-[#8F1D14]">{liveCalculation.error}</p>
              )}
            </div>

            {activeBenefits.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-bold text-[#16324F]">Benefit yang termasuk</h3>
                <ul className="mt-2.5 space-y-2">
                  {activeBenefits.map((b) => (
                    <li key={b.id} className="flex items-start gap-2 text-sm text-[#526277]">
                      <CheckCircle2
                        aria-hidden="true"
                        size={16}
                        className="mt-0.5 shrink-0 text-[#116471]"
                      />
                      <span>{b.teks}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleApproveAndSend}
                disabled={isSubmitting || Boolean(liveCalculation.error)}
                className="btn-primary w-full py-3"
              >
                <Send aria-hidden="true" size={17} />
                <span>
                  {isSubmitting ? "Menyimpan pesanan..." : "Setuju & Kirim ke WhatsApp"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#DCE4EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#172B40] transition-colors hover:bg-[#F7F8FA]"
              >
                <FileDown aria-hidden="true" size={17} />
                <span>Unduh ringkasan PDF</span>
              </button>
            </div>

            {(hasConfirmedCalc || lastOrder) && (
              <div className="mt-4 rounded-xl border border-[#167D8D]/30 bg-[#E8F4F6] p-3 text-xs text-[#172B40]">
                {lastOrder ? (
                  <div>
                    Pesanan <span className="font-bold">{lastOrder.kodePesanan}</span> telah dicatat.
                    Jika jendela WhatsApp tidak terbuka otomatis,{" "}
                    <a
                      href={lastOrder.waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#116471] underline"
                    >
                      buka WhatsApp di sini
                    </a>
                    .
                  </div>
                ) : (
                  "Ringkasan harga siap dikirim. Tekan Setuju & Kirim ke WhatsApp untuk mencatat pesanan."
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
