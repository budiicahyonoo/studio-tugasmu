import Link from "next/link";
import PublicShell from "../components/shared/PublicShell";
import FaqList from "../components/shared/FaqList";
import DatabaseUnavailable from "../components/shared/DatabaseUnavailable";
import { getPublicCatalogData, getPublicContent } from "../lib/publicData";
export const dynamic = "force-dynamic";
export default async function Home() {
  const [catalog, content] = await Promise.all([
    getPublicCatalogData(),
    getPublicContent(),
  ]);
  const services = catalog.layanan.filter(
    (item) => item.nama !== "Cek Turnitin",
  );
  return (
    <PublicShell settings={catalog.pengaturan} wide>
      <section className="home-hero mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-[1.25fr_1fr] lg:items-center">
        <div>
          <h1 className="text-[clamp(2.5rem,6vw,4.6rem)] leading-[1.1] font-extrabold tracking-tight text-[#16324F]">
            Tugasmu jelas.
            <br />
            <span className="text-[#116471]">Biayanya juga.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-[#526277]">
            Studio Tugasmu membantu kebutuhan tugas siswa dan mahasiswa. Pilih
            layanan, tinjau rincian biaya, lalu bicarakan pengerjaannya dengan
            admin.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/simulasi" className="btn-primary">
              Hitung biaya tugasmu
            </Link>
            <Link href="/layanan" className="btn-secondary">
              Pilih layanan
            </Link>
          </div>
        </div>
        <div className="price-index rounded-2xl border border-[#DCE4EB] bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 border-b border-[#DCE4EB] pb-5">
            <h2 className="text-lg font-bold text-[#16324F]">
              Dihitung sesuai kebutuhan
            </h2>
            <span
              className="h-3 w-3 shrink-0 bg-[#F4B860]"
              aria-hidden="true"
            />
          </div>
          <dl className="divide-y divide-[#DCE4EB]">
            {[
              ["Per lembar", "Artikel, paper, dan makalah"],
              ["Per slide", "Presentasi PPT"],
              ["Per paket", "Laporan, skripsi, thesis, dan projek"],
            ].map(([title, text]) => (
              <div key={title} className="py-5">
                <dt className="font-bold text-[#16324F]">{title}</dt>
                <dd className="mt-1 text-sm leading-6 text-[#526277]">
                  {text}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            href="/tarif"
            className="inline-flex min-h-11 items-center text-sm font-bold text-[#116471] underline underline-offset-4"
          >
            Lihat tarif dan cakupan paket
          </Link>
        </div>
      </section>
      <section className="border-y border-[#DCE4EB] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <h2 className="section-title">Apa yang sedang kamu kerjakan?</h2>
            <Link href="/layanan" className="btn-secondary">
              Layanan siswa dan mahasiswa
            </Link>
          </div>
          {catalog.dataUnavailable ? (
            <DatabaseUnavailable dataLabel="Daftar layanan" />
          ) : !services.length ? (
            <p className="empty-state">Katalog sedang disiapkan oleh admin.</p>
          ) : (
            <div className="service-index">
              {services.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/simulasi?layanan=${item.id}`}
                  className="service-row"
                >
                  <span className="text-sm text-[#526277]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-bold text-[#16324F]">{item.nama}</h3>
                    <p className="mt-1 text-sm text-[#526277]">
                      {item.deskripsi ||
                        item.kategoriData?.nama ||
                        item.kategori}
                    </p>
                  </div>
                  <span className="text-right text-xs text-[#526277]">
                    {item.estimasiSelesai}
                    <br />
                    {item.tipeHitung === "PER_PAKET" ? "Per paket" : "Per unit"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-[.9fr_1.1fr]">
        <div>
          <h2 className="section-title">
            Tinjau dulu.
            <br />
            Pesan setelah cocok.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#526277]">
            Rincian layanan membantu kamu mengambil keputusan sebelum membuka
            percakapan.
          </p>
        </div>
        <dl className="space-y-6">
          {[
            [
              "Tarif sesuai kelompok",
              "Pilihan fakultas menentukan kelompok Saintek atau Soshum. Harga paket ditampilkan sebagai harga total.",
            ],
            [
              "Benefit terlihat sejak awal",
              "Periksa cakupan, benefit, dan estimasi selesai pada layanan yang kamu pilih.",
            ],
            [
              "Deskripsi tetap milikmu",
              "Fitur perapian teks bersifat opsional. Kamu dapat meninjau hasilnya atau memakai deskripsi asli.",
            ],
          ].map(([title, text]) => (
            <div key={title}>
              <dt className="font-bold text-[#16324F]">{title}</dt>
              <dd className="mt-2 text-sm leading-7 text-[#526277]">{text}</dd>
            </div>
          ))}
        </dl>
      </section>
      {Number.isInteger(catalog.pengaturan.jumlahKlienDibantu) && (
        <section className="bg-[#16324F] text-white">
          <div className="mx-auto flex max-w-5xl flex-wrap items-baseline gap-4 px-4 py-9 sm:px-6">
            <strong className="text-5xl font-extrabold text-[#F4B860]">
              {catalog.pengaturan.jumlahKlienDibantu.toLocaleString("id-ID")}
            </strong>
            <div>
              <h2 className="text-xl font-bold">klien telah dibantu</h2>
              <p className="mt-2 text-sm">
                Berdasarkan catatan yang diperbarui admin Studio Tugasmu.
              </p>
            </div>
          </div>
        </section>
      )}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="section-title">Dari rincian tugas ke percakapan</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Pilih", "Isi data, fakultas, dan jenis layanan."],
            ["Jelaskan", "Tambahkan judul, instruksi, dan jumlah atau paket."],
            ["Tinjau", "Periksa biaya, estimasi selesai, dan benefit."],
            [
              "Konfirmasi",
              "Setujui rincian lalu kirim pesan di WhatsApp admin.",
            ],
          ].map(([title, text], index) => (
            <li key={title} className="border-t-2 border-[#16324F] pt-4">
              <span className="text-sm font-bold text-[#116471]">
                0{index + 1}
              </span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-[#526277]">{text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="border-t border-[#DCE4EB] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="section-title mb-7">Sebelum memulai</h2>
          {content.dataUnavailable ? (
            <DatabaseUnavailable dataLabel="FAQ" />
          ) : (
            <FaqList items={content.faq.slice(0, 4)} />
          )}
          <Link href="/faq" className="btn-secondary mt-6">
            Baca seluruh FAQ
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
