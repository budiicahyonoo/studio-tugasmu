import Link from "next/link";
import PublicShell from "../../components/shared/PublicShell";
import { getSiteSettings } from "../../lib/publicData";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Layanan siswa dan mahasiswa | Studio Tugasmu",
};
export default async function LayananPage() {
  const settings = await getSiteSettings();
  return (
    <PublicShell settings={settings}>
      <div className="page-intro">
        <h1>Bantuan sesuai jenjangmu</h1>
        <p>
          Pilih jenjang pendidikan untuk mulai merinci tugas. Tarif dan paket
          lengkap tersedia di halaman Tarif.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <article className="surface-card p-6 sm:p-8">
          <span className="text-sm font-bold text-[#116471]">
            Untuk sekolah
          </span>
          <h2 className="mt-3 text-3xl font-bold text-[#16324F]">Siswa</h2>
          <p className="mt-4 text-sm leading-7 text-[#526277]">
            Makalah, artikel, presentasi, dan laporan tugas sekolah. Jelaskan
            petunjuk dari guru pada deskripsi tugas.
          </p>
          <p className="mt-4 text-sm leading-7 text-[#526277]">
            Sementara menggunakan kelompok tarif Soshum. Rincian dapat ditinjau
            sebelum konfirmasi.
          </p>
          <Link href="/simulasi?jenjang=SISWA" className="btn-primary mt-7">
            Simulasi tugas siswa
          </Link>
        </article>
        <article className="surface-card p-6 sm:p-8">
          <span className="text-sm font-bold text-[#116471]">
            Untuk perkuliahan
          </span>
          <h2 className="mt-3 text-3xl font-bold text-[#16324F]">Mahasiswa</h2>
          <p className="mt-4 text-sm leading-7 text-[#526277]">
            Artikel, paper, PPT, laporan praktikum, PKL, skripsi, thesis, dan
            projek. Fakultas menentukan kelompok tarif Saintek atau Soshum.
          </p>
          <p className="mt-4 text-sm leading-7 text-[#526277]">
            Periksa cakupan Sempro atau Full untuk paket yang memiliki pilihan
            bab.
          </p>
          <Link href="/simulasi?jenjang=MAHASISWA" className="btn-primary mt-7">
            Simulasi tugas mahasiswa
          </Link>
        </article>
      </div>
      <Link href="/tarif" className="btn-secondary mt-8">
        Lihat tarif, paket, dan benefit
      </Link>
    </PublicShell>
  );
}
