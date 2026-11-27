import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import { getSiteSettings } from "../../lib/publicData";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Privacy Policy | Studio Tugasmu",
  description: "Kebijakan privasi pengelolaan data pelanggan Studio Tugasmu.",
};

const FALLBACK_PRIVACY = `Kebijakan Privasi Studio Tugasmu

1. Informasi yang Kami Kumpulkan
Kami mengumpulkan data yang Anda masukkan pada formulir simulasi harga, ulasan, dan cek Turnitin (nama, fakultas, judul, deskripsi tugas, dan dokumen terkait).

2. Penggunaan Informasi
Data digunakan untuk menghitung estimasi biaya, menyimpan catatan pesanan, memproses perapian teks deskripsi, serta menghubungkan pesanan ke WhatsApp admin.

3. Keamanan dan Penyimpanan
Data disimpan pada database terkelola dan file unggahan disimpan di layanan penyimpanan gambar/dokumen. Kami tidak menjual atau membagikan data pribadi Anda kepada pihak ketiga di luar kebutuhan pemrosesan pesanan.`;

export default async function PrivacyPage() {
  const pengaturan = await getSiteSettings();
  const content = pengaturan.kebijakanPrivasi?.trim() || FALLBACK_PRIVACY;

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[70] rounded-lg bg-white px-4 py-3 font-semibold text-[#16324F] shadow-lg focus:not-sr-only"
      >
        Lewati ke konten utama
      </a>
      <Navbar nomorWhatsApp={pengaturan.nomorWhatsApp} />
      <main id="main-content" tabIndex="-1" className="mx-auto w-full max-w-3xl flex-grow px-4 py-10 sm:px-6 sm:py-12">
        <article className="surface-card p-6 sm:p-10">
          <h1 className="text-[clamp(1.75rem,3vw,2.25rem)] font-bold text-[#16324F]">
            Kebijakan Privasi
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
