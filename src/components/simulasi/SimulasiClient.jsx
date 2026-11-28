"use client";
import { useRef, useState } from "react";
import { polishDescription } from "../../actions/ai";
import { submitSimulasiOrder } from "../../actions/simulasi";
import { resolveQuote } from "../../lib/quote";
import {
  buildWhatsAppOrderMessage,
  formatRupiah,
} from "../../lib/calculateEstimate";
import { useToast } from "../shared/ToastProvider";
import DatabaseUnavailable from "../shared/DatabaseUnavailable";

export default function SimulasiClient({
  fakultasList = [],
  layananList = [],
  nomorWhatsApp,
  initialLayananId = "",
  initialJenjang = "MAHASISWA",
  dataUnavailable = false,
}) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    nama: "",
    jenjang: initialJenjang,
    fakultasId: fakultasList[0]?.id || "",
    layananId:
      layananList.find((item) => item.id === initialLayananId)?.id ||
      layananList[0]?.id ||
      "",
    paketId: "",
    jumlah: "1",
    judul: "",
    deskripsiAsli: "",
  });
  const [aiText, setAiText] = useState("");
  const [useAi, setUseAi] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [sending, setSending] = useState(false);
  const [reviewed, setReviewed] = useState("");
  const [lastOrder, setLastOrder] = useState(null);
  const [contactUrl, setContactUrl] = useState("");
  const request = useRef({ payload: "", id: "" });
  const service = layananList.find((item) => item.id === form.layananId);
  const faculty =
    form.jenjang === "SISWA"
      ? fakultasList.find((item) => item.kelompok === "SOSHUM")
      : fakultasList.find((item) => item.id === form.fakultasId);
  const group = form.jenjang === "SISWA" ? "SOSHUM" : faculty?.kelompok;
  const packages =
    service?.paket.filter((item) => item.kelompok === group) || [];
  const selectedPackage =
    packages.find((item) => item.id === form.paketId) || packages[0];
  const rate = service?.tarif.find((item) => item.kelompok === group);
  let quote;
  let quoteError;
  try {
    quote = resolveQuote({
      layanan: service,
      fakultas: faculty,
      jenjang: form.jenjang,
      paketId: selectedPackage?.id,
      jumlah: Number(form.jumlah),
    });
  } catch (error) {
    quoteError = error.message;
  }
  const payload = {
    ...form,
    fakultasId: faculty?.id,
    paketId: service?.tipeHitung === "PER_PAKET" ? selectedPackage?.id : null,
    jumlah: service?.tipeHitung === "PER_PAKET" ? null : Number(form.jumlah),
    deskripsiAI: useAi ? aiText : null,
    quotedTotal: quote?.total,
  };
  const fingerprint = JSON.stringify(payload);
  const change = (name, value) => {
    setForm((old) => ({ ...old, [name]: value }));
    setLastOrder(null);
    setContactUrl("");
  };
  const field = (name, label, props = {}) => (
    <div>
      <label
        htmlFor={`sim-${name}`}
        className="mb-2 block text-sm font-semibold"
      >
        {label}
      </label>
      <input
        id={`sim-${name}`}
        className="field-input"
        name={name}
        value={form[name]}
        onChange={(event) => change(name, event.target.value)}
        {...props}
      />
    </div>
  );
  const waUrl = (data, code) =>
    `https://wa.me/${String(data.nomorWhatsApp || nomorWhatsApp || "").replace(/\D/g, "")}?text=${encodeURIComponent(buildWhatsAppOrderMessage({ ...data, kodePesanan: code, nama: form.nama, judul: form.judul, deskripsi: useAi ? aiText : form.deskripsiAsli, fakultasNama: form.jenjang === "SISWA" ? "Siswa (tarif Soshum)" : data.fakultasNama }))}`;
  async function polish() {
    setPolishing(true);
    try {
      const result = await polishDescription({
        deskripsi: form.deskripsiAsli,
        layananNama: service?.nama,
      });
      if (result.ok) {
        setAiText(result.deskripsiRapih);
        setUseAi(false);
        showToast(
          "Hasil perapian siap ditinjau. Pilih versi yang akan digunakan.",
          "success",
        );
      } else
        showToast(result.message || "Deskripsi asli tetap digunakan.", "info");
    } catch {
      showToast(
        "Perapian belum tersedia. Deskripsi asli tetap digunakan.",
        "info",
      );
    } finally {
      setPolishing(false);
    }
  }
  function review(event) {
    event.preventDefault();
    if (quoteError) {
      showToast(quoteError, "error");
      return;
    }
    setReviewed(fingerprint);
    showToast(
      "Rincian siap. Periksa harga dan benefit sebelum menyetujui.",
      "success",
    );
  }
  async function approve() {
    if (sending || reviewed !== fingerprint || quoteError) return;
    if (request.current.payload !== fingerprint)
      request.current = { payload: fingerprint, id: crypto.randomUUID() };
    setSending(true);
    try {
      const result = await submitSimulasiOrder({
        ...payload,
        requestId: request.current.id,
      });
      if (!result.ok) {
        showToast(result.error, "error");
        if (result.canContact && nomorWhatsApp)
          setContactUrl(waUrl(quote, null));
        return;
      }
      const url = waUrl(result, result.kodePesanan);
      setLastOrder({ ...result, waUrl: url });
      showToast(
        "Pesanan tersimpan. Kirim pesan yang sudah disiapkan di WhatsApp.",
        "success",
      );
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      showToast("Pesanan belum dapat diproses. Coba lagi.", "error");
    } finally {
      setSending(false);
    }
  }
  async function download() {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Ringkasan simulasi Studio Tugasmu", 18, 22);
      doc.setFontSize(11);
      const lines = [
        lastOrder
          ? `Kode: ${lastOrder.kodePesanan}`
          : "Simulasi belum menjadi pesanan.",
        `Nama: ${form.nama}`,
        `Layanan: ${service?.nama}`,
        `Kelompok: ${group}`,
        quote?.paketNama
          ? `Paket: ${quote.paketNama}`
          : `Jumlah: ${form.jumlah} ${service?.tipeHitung === "PER_SLIDE" ? "slide" : "lembar"}`,
        `Judul: ${form.judul}`,
        `Total: ${formatRupiah(quote.total)}`,
        `Estimasi: ${quote.estimasiSelesai}`,
      ];
      let y = 35;
      for (const line of lines) {
        const wrapped = doc.splitTextToSize(line, 170);
        doc.text(wrapped, 18, y);
        y += wrapped.length * 6 + 4;
      }
      doc.save("simulasi-studio-tugasmu.pdf");
    } catch {
      showToast("Ringkasan PDF belum dapat diunduh.", "error");
    }
  }
  if (dataUnavailable)
    return <DatabaseUnavailable dataLabel="Simulasi harga" />;
  if (!layananList.length || !fakultasList.length)
    return (
      <p className="empty-state">
        Katalog atau fakultas belum tersedia. Hubungi admin untuk informasi
        layanan.
      </p>
    );
  return (
    <div className="grid items-start gap-7 lg:grid-cols-[1.3fr_1fr]">
      <form onSubmit={review} className="surface-card p-5 sm:p-7">
        <fieldset disabled={sending} className="space-y-7">
          <section>
            <h2 className="form-section-title">1. Data pengguna</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {field("nama", "Nama lengkap", {
                required: true,
                minLength: 2,
                maxLength: 100,
                autoComplete: "name",
              })}
              <div>
                <label
                  htmlFor="sim-jenjang"
                  className="mb-2 block text-sm font-semibold"
                >
                  Jenjang pendidikan
                </label>
                <select
                  id="sim-jenjang"
                  className="field-input"
                  value={form.jenjang}
                  onChange={(event) => change("jenjang", event.target.value)}
                >
                  <option value="MAHASISWA">Mahasiswa</option>
                  <option value="SISWA">Siswa</option>
                </select>
              </div>
            </div>
            {form.jenjang === "MAHASISWA" ? (
              <div className="mt-5">
                <label
                  htmlFor="sim-fakultas"
                  className="mb-2 block text-sm font-semibold"
                >
                  Fakultas / rumpun
                </label>
                <select
                  id="sim-fakultas"
                  className="field-input"
                  value={form.fakultasId}
                  onChange={(event) => change("fakultasId", event.target.value)}
                >
                  {["SOSHUM", "SAINTEK"].map((value) => (
                    <optgroup key={value} label={value}>
                      {fakultasList
                        .filter((item) => item.kelompok === value)
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.nama}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#526277]">
                Tugas siswa sementara menggunakan kelompok Soshum.
              </p>
            )}
          </section>
          <section className="border-t border-[#DCE4EB] pt-6">
            <h2 className="form-section-title">2. Data layanan</h2>
            <label
              htmlFor="sim-layanan"
              className="mt-4 mb-2 block text-sm font-semibold"
            >
              Jenis layanan
            </label>
            <select
              id="sim-layanan"
              value={form.layananId}
              onChange={(event) => change("layananId", event.target.value)}
              className="field-input"
            >
              {layananList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
            {service?.tipeHitung === "PER_PAKET" ? (
              <div className="mt-5">
                <label
                  htmlFor="sim-paket"
                  className="mb-2 block text-sm font-semibold"
                >
                  Paket dan cakupan ({group})
                </label>
                <select
                  id="sim-paket"
                  className="field-input"
                  value={selectedPackage?.id || ""}
                  onChange={(event) => change("paketId", event.target.value)}
                  disabled={!packages.length}
                >
                  {!packages.length && (
                    <option value="">Paket belum diatur admin</option>
                  )}
                  {packages.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama} · {formatRupiah(item.harga)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mt-5">
                {field(
                  "jumlah",
                  `Jumlah ${service?.tipeHitung === "PER_SLIDE" ? "slide" : "lembar"}`,
                  {
                    type: "number",
                    min: 1,
                    max: 1000,
                    required: true,
                    inputMode: "numeric",
                  },
                )}
                <p className="mt-2 text-sm text-[#116471]">
                  {rate
                    ? `${formatRupiah(rate.hargaPerUnit)} / ${service?.tipeHitung === "PER_SLIDE" ? "slide" : "lembar"}`
                    : "Tarif belum diatur admin"}{" "}
                  · {service?.estimasiSelesai}
                </p>
              </div>
            )}
          </section>
          <section className="border-t border-[#DCE4EB] pt-6">
            <h2 className="form-section-title">3. Detail tugas</h2>
            <div className="mt-4">
              {field("judul", "Judul atau topik tugas", {
                required: true,
                minLength: 3,
                maxLength: 200,
              })}
            </div>
            <label
              htmlFor="sim-deskripsi"
              className="mt-5 mb-2 block text-sm font-semibold"
            >
              Deskripsi dan instruksi
            </label>
            <textarea
              id="sim-deskripsi"
              className="field-input"
              rows={5}
              required
              minLength={5}
              maxLength={4000}
              value={form.deskripsiAsli}
              onChange={(event) => {
                change("deskripsiAsli", event.target.value);
                setAiText("");
                setUseAi(false);
              }}
            />
            <p className="mt-2 text-sm leading-6 text-[#526277]">
              Perapian bersifat opsional. Teks deskripsi dikirim ke Groq atau
              OpenRouter hanya saat tombol ditekan. Hindari data pribadi di
              deskripsi.
            </p>
            <button
              type="button"
              className="btn-secondary mt-3"
              disabled={polishing || form.deskripsiAsli.trim().length < 5}
              onClick={polish}
            >
              {polishing
                ? "Merapikan deskripsi..."
                : "Rapikan deskripsi dengan AI"}
            </button>
            {aiText && (
              <div className="mt-4 rounded-xl bg-[#E8F4F6] p-4">
                <label
                  htmlFor="sim-ai"
                  className="mb-2 block text-sm font-semibold"
                >
                  Tinjau atau edit hasil perapian
                </label>
                <textarea
                  id="sim-ai"
                  className="field-input"
                  rows={5}
                  maxLength={4000}
                  value={aiText}
                  onChange={(event) => setAiText(event.target.value)}
                />
                <label className="mt-3 flex min-h-11 items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={useAi}
                    onChange={(event) => setUseAi(event.target.checked)}
                  />
                  Gunakan hasil perapian ini
                </label>
              </div>
            )}
          </section>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={Boolean(quoteError)}
          >
            Hitung dan tinjau rincian
          </button>
        </fieldset>
      </form>
      <aside className="surface-card p-5 sm:p-7 lg:sticky lg:top-24">
        <h2 className="text-xl font-bold text-[#16324F]">Rincian simulasimu</h2>
        <div className="my-6 border-y border-[#DCE4EB] py-5" aria-live="polite">
          <p className="text-sm text-[#526277]">Total biaya</p>
          <p className="mt-2 text-4xl font-extrabold text-[#16324F]">
            {quoteError ? "Belum tersedia" : formatRupiah(quote.total)}
          </p>
          {quoteError && (
            <p className="mt-3 text-sm text-[#8F1D14]">{quoteError}</p>
          )}
        </div>
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-[#526277]">Layanan</dt>
            <dd className="mt-1 font-semibold">
              {service?.nama} · {group}
            </dd>
          </div>
          {quote?.paketNama && (
            <div>
              <dt className="text-[#526277]">Cakupan</dt>
              <dd className="mt-1 font-semibold">
                {quote.paketNama} (harga total)
              </dd>
              {quote.paketDeskripsi && (
                <p className="mt-2 whitespace-pre-line leading-6 text-[#526277]">
                  {quote.paketDeskripsi}
                </p>
              )}
            </div>
          )}
          <div>
            <dt className="text-[#526277]">Estimasi selesai</dt>
            <dd className="mt-1 font-semibold">{service?.estimasiSelesai}</dd>
          </div>
        </dl>
        {!!quote?.benefit.length && (
          <div className="mt-6">
            <h3 className="text-sm font-bold">Benefit yang termasuk</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#526277]">
              {quote.benefit.map((item) => (
                <li key={item.id}>{item.teks}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-6 rounded-lg bg-[#FEF6E7] p-3 text-sm leading-6 text-[#172B40]">
          {reviewed === fingerprint
            ? "Rincian sudah ditinjau. Dengan menyetujui, data ini disimpan sebagai pesanan dan pesan disiapkan di WhatsApp."
            : "Lengkapi formulir dan tekan Hitung dan tinjau rincian sebelum menyetujui."}
        </p>
        <button
          type="button"
          onClick={approve}
          disabled={
            sending ||
            Boolean(quoteError) ||
            reviewed !== fingerprint ||
            Boolean(lastOrder)
          }
          className="btn-primary mt-4 w-full"
        >
          {sending ? "Menyimpan pesanan..." : "Setuju dan buka WhatsApp"}
        </button>
        <button
          type="button"
          className="btn-secondary mt-3 w-full"
          onClick={download}
          disabled={Boolean(quoteError)}
        >
          Unduh ringkasan PDF
        </button>
        {lastOrder && (
          <div role="status" className="mt-4 break-words text-sm leading-7">
            <p>
              Pesanan tersimpan: <strong>{lastOrder.kodePesanan}</strong>.
            </p>
            <a
              href={lastOrder.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-bold text-[#116471] underline"
            >
              Buka kembali pesan WhatsApp
            </a>
            <p>Tekan Kirim di WhatsApp agar pesan diterima admin.</p>
          </div>
        )}
        {contactUrl && (
          <div className="mt-4 text-sm leading-7">
            <p>Pesanan belum tercatat di sistem.</p>
            <a
              href={contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-bold text-[#116471] underline"
            >
              Kirim rincian tanpa kode ke admin
            </a>
          </div>
        )}
      </aside>
    </div>
  );
}
