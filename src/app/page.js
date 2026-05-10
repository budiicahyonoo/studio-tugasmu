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
  const layananDariDb = await prisma.layanan.findMany({
    orderBy: { createdAt: "asc" }
  });

  const ulasanDariDb = await prisma.ulasan.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" }
  });
  
  const portfolioDariDb = await prisma.portfolio.findMany({ 
    orderBy: { createdAt: "desc" } 
  });

  return (
    // PENGUNCI LAPIS KEDUA: w-full, max-w-[100vw], overflow-x-hidden
    <div className="flex flex-col min-h-screen bg-[#000000] w-full max-w-[100vw] overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow relative z-10 w-full">
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