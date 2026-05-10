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
  // Ambil Layanan
  const layananDariDb = await prisma.layanan.findMany({
    orderBy: { createdAt: "asc" }
  });

  // Ambil Ulasan yang HANYA berstatus APPROVED
  const ulasanDariDb = await prisma.ulasan.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" }
  });
  const portfolioDariDb = await prisma.portfolio.findMany({ 
    orderBy: { createdAt: "desc" } });

  return (
    <>
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Calculator />
        <Services layananDb={layananDariDb} />
        <Portfolio portfolioDb={portfolioDariDb} />
        
        {/* Kirim data ulasan asli ke komponen */}
        <Reviews ulasanDb={ulasanDariDb} />
      </main>

      <Footer />
    </>
  );
}