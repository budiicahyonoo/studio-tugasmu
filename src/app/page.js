import Navbar from "../components/shared/Navbar";
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

      <footer className="relative z-10 py-8 text-center border-t border-white/10 bg-slate-950">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} <span className="text-sky-400 font-medium">Studio Tugasmu</span>. All rights reserved.
        </p>
      </footer>
    </>
  );
}