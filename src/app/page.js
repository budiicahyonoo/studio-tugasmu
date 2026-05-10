import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import Hero from "../components/sections/Hero";
import Calculator from "../components/sections/Calculator";
import Services from "../components/sections/Services";
import Portfolio from "../components/sections/Portfolio";
import Reviews from "../components/sections/Reviews";
import { prisma } from "../lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Ambil Layanan (Logika AMAN 100%)
  const layananDariDb = await prisma.layanan.findMany({
    orderBy: { createdAt: "asc" }
  });

  // Ambil Ulasan (Logika AMAN 100%)
  const ulasanDariDb = await prisma.ulasan.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" }
  });
  
  // Ambil Portfolio (Logika AMAN 100%)
  const portfolioDariDb = await prisma.portfolio.findMany({ 
    orderBy: { createdAt: "desc" } 
  });

  return (
    // BUNGKUSAN BARU: Mematikan sisa layar kosong di bawah footer
    <div className="flex flex-col min-h-screen bg-[#000000] overflow-x-hidden">
      <Navbar />
      
      {/* flex-grow akan mendorong footer selalu presisi di paling bawah konten */}
      <main className="flex-grow relative z-10">
        <Hero />
        <Calculator />
        <Services layananDb={layananDariDb} />
        <Portfolio portfolioDb={portfolioDariDb} />
        <Reviews ulasanDb={ulasanDariDb} />
      </main>

      <Footer />
    </div>
  );
}