import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import SimulasiClient from "../../components/simulasi/SimulasiClient";
import { getPublicCatalogData } from "../../lib/publicData";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Simulasi Harga | Studio Tugasmu",
  description:
    "Hitung biaya tugas kuliah secara otomatis sesuai kelompok fakultas Saintek atau Soshum, rapikan deskripsi, dan kirim ke WhatsApp.",
};

export default async function SimulasiPage({ searchParams }) {
  const params = await searchParams;
  const initialLayananId = typeof params?.layanan === "string" ? params.layanan : "";
  const { fakultas, layanan, pengaturan, dataUnavailable } = await getPublicCatalogData();

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
        className="mx-auto w-full max-w-6xl flex-grow px-4 py-10 sm:px-6 sm:py-12"
      >
        <div className="mb-8">
          <h1 className="text-[clamp(1.875rem,3vw,2.5rem)] font-bold text-[#16324F]">
            Simulasi Harga Tugas
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#526277] sm:text-base">
            Pilih fakultas dan layanan untuk melihat harga pasti tanpa menunggu balasan chat.
            Estimasi standar selesai dalam 1x24 jam.
          </p>
        </div>

        <SimulasiClient
          fakultasList={fakultas}
          layananList={layanan}
          nomorWhatsApp={pengaturan.nomorWhatsApp}
          initialLayananId={initialLayananId}
          dataUnavailable={dataUnavailable}
        />
      </main>

      <Footer
        instagramUrl={pengaturan.instagramUrl}
        emailKontak={pengaturan.emailKontak}
      />
    </div>
  );
}
