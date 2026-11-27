import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import DatabaseUnavailable from "../../components/shared/DatabaseUnavailable";
import { getPublicCatalogData } from "../../lib/publicData";
import { formatRupiah } from "../../lib/calculateEstimate";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Katalog Layanan & Tarif | Studio Tugasmu",
  description:
    "Daftar lengkap layanan Umum, Khusus, dan PKL beserta tarif Soshum, Saintek, paket, benefit, dan estimasi selesai.",
};

const KATEGORI_LIST = [
  { key: "ALL", label: "Semua Kategori" },
  { key: "UMUM", label: "Umum" },
  { key: "KHUSUS", label: "Khusus" },
  { key: "PKL", label: "PKL" },
];

export default async function LayananPage({ searchParams }) {
  const params = await searchParams;
  const activeKategori =
    typeof params?.kategori === "string" && ["UMUM", "KHUSUS", "PKL"].includes(params.kategori)
      ? params.kategori
      : "ALL";

  const { layanan, pengaturan, dataUnavailable } = await getPublicCatalogData();
  const filteredLayanan =
    activeKategori === "ALL"
      ? layanan
      : layanan.filter((item) => item.kategori === activeKategori);

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[70] rounded-lg bg-white px-4 py-3 font-semibold text-[#16324F] shadow-lg focus:not-sr-only"
      >
        Lewati ke konten utama
      </a>
      <Navbar nomorWhatsApp={pengaturan.nomorWhatsApp} />

      <main id="main-content" tabIndex="-1" className="mx-auto w-full max-w-5xl flex-grow px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-[clamp(1.875rem,3vw,2.5rem)] font-bold text-[#16324F]">
              Katalog Layanan & Tarif
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#526277] sm:text-base">
              Seluruh harga bersifat pasti sesuai kelompok fakultas Soshum dan Saintek, tanpa biaya
              kilat tambahan.
            </p>
          </div>
          <Link href="/simulasi" className="btn-primary shrink-0">
            Hitung di Simulasi
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2" role="navigation" aria-label="Filter kategori layanan">
          {KATEGORI_LIST.map((kat) => {
            const isSelected = activeKategori === kat.key;
            return (
              <Link
                key={kat.key}
                href={kat.key === "ALL" ? "/layanan" : `/layanan?kategori=${kat.key}`}
                className={`inline-flex min-h-11 items-center rounded-xl border px-4 text-sm font-semibold transition-colors ${
                  isSelected
                    ? "border-[#16324F] bg-[#16324F] text-white"
                    : "border-[#DCE4EB] bg-white text-[#172B40] hover:border-[#167D8D] hover:text-[#116471]"
                }`}
              >
                {kat.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 space-y-6">
          {dataUnavailable ? (
            <DatabaseUnavailable dataLabel="Katalog layanan" />
          ) : filteredLayanan.length === 0 ? (
            <div className="surface-card p-8 text-center text-sm text-[#526277]">
              Belum ada layanan pada kategori ini.
            </div>
          ) : (
            filteredLayanan.map((item) => {
              const soshumTarif = item.tarif?.find((t) => t.kelompok === "SOSHUM");
              const saintekTarif = item.tarif?.find((t) => t.kelompok === "SAINTEK");
              const unitSuffix = item.tipeHitung === "PER_SLIDE" ? "slide" : "lembar";

              return (
                <article
                  key={item.id}
                  className="surface-card p-6"
                >
                  <div className="flex flex-col justify-between gap-4 border-b border-[#DCE4EB] pb-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-[#E8F4F6] px-2.5 py-1 text-xs font-bold text-[#116471]">
                          {item.kategori}
                        </span>
                        <span className="text-xs font-medium text-[#526277]">
                          Estimasi {item.estimasiSelesai}
                        </span>
                      </div>
                      <h2 className="mt-2 text-xl font-bold text-[#16324F]">{item.nama}</h2>
                      {item.deskripsi && (
                        <p className="mt-1 text-sm text-[#526277]">{item.deskripsi}</p>
                      )}
                    </div>
                    <Link
                      href={`/simulasi?layanan=${item.id}`}
                      className="btn-secondary shrink-0 bg-[#E8F4F6]"
                    >
                      Simulasikan {item.nama}
                    </Link>
                  </div>

                  {item.tipeHitung === "PER_PAKET" ? (
                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {["SOSHUM", "SAINTEK"].map((kelompok) => {
                        const pakets = (item.paket || []).filter((p) => p.kelompok === kelompok);
                        return (
                          <div key={kelompok} className="rounded-xl border border-[#DCE4EB] bg-[#F7F8FA] p-4">
                            <h3 className="text-sm font-bold text-[#16324F]">
                              Kelompok {kelompok === "SOSHUM" ? "Soshum" : "Saintek"}
                            </h3>
                            {pakets.length === 0 ? (
                              <p className="mt-2 text-xs text-[#526277]">Belum ada paket.</p>
                            ) : (
                              <div className="mt-3 space-y-3">
                                {pakets.map((pkt) => (
                                  <div key={pkt.id} className="rounded-lg border border-[#DCE4EB] bg-white p-3.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-sm font-bold text-[#172B40]">{pkt.nama}</span>
                                      <span className="text-sm font-bold text-[#16324F]">
                                        {formatRupiah(pkt.harga)}
                                      </span>
                                    </div>
                                    {pkt.benefit?.length > 0 && (
                                      <ul className="mt-2 space-y-1">
                                        {pkt.benefit.map((b) => (
                                          <li key={b.id} className="flex items-start gap-2 text-xs text-[#526277]">
                                            <CheckCircle2 aria-hidden="true" size={14} className="mt-0.5 shrink-0 text-[#116471]" />
                                            <span>{b.teks}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-[#DCE4EB] bg-[#F7F8FA] p-4">
                        <div className="text-xs font-semibold text-[#526277]">Tarif Soshum</div>
                        <div className="mt-1 text-xl font-bold text-[#16324F]">
                          {formatRupiah(soshumTarif?.hargaPerUnit || 0)} / {unitSuffix}
                        </div>
                      </div>
                      <div className="rounded-xl border border-[#DCE4EB] bg-[#F7F8FA] p-4">
                        <div className="text-xs font-semibold text-[#526277]">Tarif Saintek</div>
                        <div className="mt-1 text-xl font-bold text-[#16324F]">
                          {formatRupiah(saintekTarif?.hargaPerUnit || 0)} / {unitSuffix}
                        </div>
                      </div>
                    </div>
                  )}

                  {item.benefit?.length > 0 && (
                    <div className="mt-5">
                      <h3 className="text-xs font-bold text-[#16324F]">
                        Benefit layanan
                      </h3>
                      <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {item.benefit.map((b) => (
                          <li key={b.id} className="flex items-start gap-2 text-sm text-[#526277]">
                            <CheckCircle2 aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-[#116471]" />
                            <span>{b.teks}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </main>

      <Footer
        instagramUrl={pengaturan.instagramUrl}
        emailKontak={pengaturan.emailKontak}
      />
    </div>
  );
}
