import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import Hero from "../components/sections/Hero";
import Services from "../components/sections/Services";
import Portfolio from "../components/sections/Portfolio";
import Reviews from "../components/sections/Reviews";
import { prisma } from "../lib/prisma";
import { getPublicCatalogData } from "../lib/publicData";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { layanan, pengaturan, dataUnavailable: catalogUnavailable } =
    await getPublicCatalogData();

  let ulasanDariDb = [];
  let portfolioDariDb = [];
  let extraUnavailable = false;

  try {
    [ulasanDariDb, portfolioDariDb] = await Promise.all([
      prisma.ulasan.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.portfolio.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);
  } catch (error) {
    console.error("Gagal memuat ulasan atau portofolio:", error);
    extraUnavailable = true;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[70] rounded-lg bg-white px-4 py-3 font-semibold text-[#16324F] shadow-lg focus:not-sr-only"
      >
        Lewati ke konten utama
      </a>
      <Navbar nomorWhatsApp={pengaturan.nomorWhatsApp} />

      <main id="main-content" tabIndex="-1" className="w-full flex-grow">
        <Hero />
        <Services layananDb={layanan} dataUnavailable={catalogUnavailable} />
        <Portfolio portfolioDb={portfolioDariDb} dataUnavailable={extraUnavailable} />
        <Reviews ulasanDb={ulasanDariDb} dataUnavailable={extraUnavailable} />
      </main>

      <Footer
        instagramUrl={pengaturan.instagramUrl}
        emailKontak={pengaturan.emailKontak}
      />
    </div>
  );
}
