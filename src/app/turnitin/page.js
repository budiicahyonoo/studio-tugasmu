import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import TurnitinClient from "../../components/turnitin/TurnitinClient";
import { getPublicCatalogData } from "../../lib/publicData";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cek Turnitin (QRIS) | Studio Tugasmu",
  description:
    "Unggah dokumen untuk pengecekan Turnitin, bayar dengan QRIS, dan unduh hasil laporan PDF setelah verifikasi admin.",
};

export default async function TurnitinPage() {
  const { fakultas, pengaturan } = await getPublicCatalogData();

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
        <div className="mb-8">
          <h1 className="text-[clamp(1.875rem,3vw,2.5rem)] font-bold text-[#16324F]">
            Cek Turnitin & Pembayaran QRIS
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#526277] sm:text-base">
            Unggah dokumen Anda, lakukan pembayaran QRIS sesuai nominal dan kode pesanan, lalu
            unduh hasil pengecekan PDF setelah diverifikasi admin.
          </p>
        </div>

        <TurnitinClient
          fakultasList={fakultas}
          qrisImageUrl={pengaturan.qrisImageUrl}
          namaRekening={pengaturan.namaRekening}
          nomorWhatsApp={pengaturan.nomorWhatsApp}
        />
      </main>

      <Footer
        instagramUrl={pengaturan.instagramUrl}
        emailKontak={pengaturan.emailKontak}
      />
    </div>
  );
}
