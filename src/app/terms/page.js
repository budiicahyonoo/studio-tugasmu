import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import { getSiteSettings } from "../../lib/publicData";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms of Service | Studio Tugasmu",
  description: "Syarat dan ketentuan penggunaan layanan Studio Tugasmu.",
};

const FALLBACK_TERMS = `Syarat dan Ketentuan Studio Tugasmu

1. Ketentuan Layanan
Studio Tugasmu menyediakan layanan pendampingan tugas akademik dan pengecekan kemiripan dokumen sesuai cakupan layanan atau paket yang dipilih pada simulasi harga.

2. Tarif dan Pembayaran
Tarif yang tampil pada simulasi adalah angka pasti sesuai kelompok fakultas Saintek atau Soshum. Pembayaran layanan Cek Turnitin dilakukan melalui QRIS dan diverifikasi secara manual oleh admin.

3. Estimasi dan Revisi
Estimasi standar penyelesaian adalah 1x24 jam atau sesuai keterangan pada layanan yang dipilih.`;

export default async function TermsPage() {
  const pengaturan = await getSiteSettings();
  const content = pengaturan.syaratKetentuan?.trim() || FALLBACK_TERMS;

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[70] rounded-lg bg-white px-4 py-3 font-semibold text-[#16324F] shadow-lg focus:not-sr-only"
      >
        Lewati ke konten utama
      </a>
      <Navbar nomorWhatsApp={pengaturan.nomorWhatsApp} />
      <main
        id="main-content"
        tabIndex="-1"
        className="mx-auto w-full max-w-3xl flex-grow px-4 py-10 sm:px-6 sm:py-12"
      >
        <article className="surface-card p-6 sm:p-10">
          <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-bold text-[#16324F]">
            Syarat dan Ketentuan
          </h1>
          <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-[#526277] sm:text-base">
            {content}
          </div>
        </article>
      </main>
      <Footer
        instagramUrl={pengaturan.instagramUrl}
        emailKontak={pengaturan.emailKontak}
      />
    </div>
  );
}
