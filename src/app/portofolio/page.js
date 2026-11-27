import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import Portfolio from "../../components/sections/Portfolio";
import { prisma } from "../../lib/prisma";
import { getSiteSettings } from "../../lib/publicData";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portofolio Karya | Studio Tugasmu",
  description: "Daftar contoh karya laporan, soal, dan proyek dari Studio Tugasmu.",
};

export default async function PortofolioPage() {
  const pengaturan = await getSiteSettings();
  let portfolioDariDb = [];
  let dataUnavailable = false;

  try {
    portfolioDariDb = await prisma.portfolio.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Gagal memuat portofolio:", error);
    dataUnavailable = true;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[70] rounded-lg bg-white px-4 py-3 font-semibold text-[#16324F] shadow-lg focus:not-sr-only"
      >
        Lewati ke konten utama
      </a>
      <Navbar nomorWhatsApp={pengaturan.nomorWhatsApp} />
      <main id="main-content" tabIndex="-1" className="w-full flex-grow">
        <Portfolio
          portfolioDb={portfolioDariDb}
          dataUnavailable={dataUnavailable}
          isStandalonePage
        />
      </main>
      <Footer
        instagramUrl={pengaturan.instagramUrl}
        emailKontak={pengaturan.emailKontak}
      />
    </div>
  );
}
