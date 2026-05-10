"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Video, X, Menu, ChevronRight } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const waLink = `https://wa.me/6283151195556?text=${encodeURIComponent("Halo Admin Studio Tugasmu!\n\nNama saya : ...\nSaya ingin konsultasi mengenai : ...")}`;
  const calendlyLink = "https://calendly.com/stackplustudio";

  const navLinks = [
    { name: "Beranda", href: "#beranda" },
    { name: "Cara Order", href: "#cara-order" },
    { name: "Layanan", href: "#layanan" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Ulasan", href: "#ulasan" },
  ];

  return (
    <>
      {/* 1. NAVBAR DENGAN ROUNDED BAWAH */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 rounded-b-3xl md:rounded-b-[2.5rem] ${
        isScrolled || isMenuOpen
          ? "bg-[#14213D]/95 backdrop-blur-lg border-b border-[#FCA311]/20 shadow-2xl py-3 md:py-4"
          : "bg-transparent py-4 md:py-5"
      }`}>
        <div className="w-full max-w-7xl mx-auto px-5 md:px-12 flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 z-50" onClick={() => setIsMenuOpen(false)}>
            <img src="/logo.png" alt="Logo" className="h-7 md:h-10 w-auto object-contain" />
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#E5E5E5]">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="hover:text-[#FCA311] transition-colors">
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Desktop */}
          <div className="hidden md:block flex-shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#000000] px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg"
            >
              Mulai Konsultasi
            </button>
          </div>

          {/* 2. TOMBOL BURGER (DIAMANKAN DARI POTONGAN LAYAR) */}
          <div className="md:hidden flex items-center z-50 flex-shrink-0">
             <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[#FCA311] p-2 bg-[#14213D]/80 rounded-lg border border-[#FCA311]/30 hover:bg-[#FCA311]/10 transition-colors shadow-md"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
          </div>
        </div>

        {/* ISI MENU BURGER */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col px-6 py-4 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex justify-between items-center text-[#E5E5E5] text-base font-medium border-b border-[#E5E5E5]/10 pb-3"
                  >
                    {link.name} <ChevronRight size={18} className="text-[#FCA311]" />
                  </Link>
                ))}
                <button
                  onClick={() => { setIsModalOpen(true); setIsMenuOpen(false); }}
                  className="w-full bg-[#FCA311] text-[#000000] py-3.5 rounded-xl font-bold mt-3 shadow-[0_4px_15px_rgba(252,163,17,0.3)]"
                >
                  Konsultasi Sekarang
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 3. POPUP MODAL (MOBILE FRIENDLY SIZE) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              // Penyesuaian lebar (w-[95%]) dan padding (p-6) untuk HP
              className="relative bg-[#14213D] border border-[#FCA311]/30 rounded-2xl md:rounded-3xl p-6 md:p-8 w-[95%] max-w-md shadow-[0_0_30px_rgba(252,163,17,0.2)] z-10"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-[#E5E5E5]/50 hover:text-[#FCA311]">
                <X size={24} />
              </button>

              <h3 className="text-xl md:text-2xl font-bold text-[#FFFFFF] mb-2 pr-6">Pilih Jalur Diskusi</h3>
              <p className="text-[#E5E5E5]/70 text-xs md:text-sm mb-6">Tim Studio Tugasmu siap membantu kebutuhan akademikmu.</p>

              <div className="flex flex-col gap-3 md:gap-4">
                <a href={waLink} target="_blank" className="flex items-center gap-3 md:gap-4 bg-[#000000]/40 border border-[#E5E5E5]/10 hover:border-[#FCA311] p-3 md:p-4 rounded-xl md:rounded-2xl transition-all group">
                  <div className="bg-[#25D366]/20 p-2.5 md:p-3 rounded-lg md:rounded-xl"><MessageCircle className="text-[#25D366]" size={24} /></div>
                  <div>
                    <h4 className="text-[#FFFFFF] font-bold text-sm md:text-base">WhatsApp Chat</h4>
                    <p className="text-[#E5E5E5]/50 text-[10px] md:text-xs">Fast Respon (Rekomendasi)</p>
                  </div>
                </a>

                <a href={calendlyLink} target="_blank" className="flex items-center gap-3 md:gap-4 bg-[#000000]/40 border border-[#E5E5E5]/10 hover:border-[#FCA311] p-3 md:p-4 rounded-xl md:rounded-2xl transition-all group">
                  <div className="bg-[#4285F4]/20 p-2.5 md:p-3 rounded-lg md:rounded-xl"><Video className="text-[#4285F4]" size={24} /></div>
                  <div>
                    <h4 className="text-[#FFFFFF] font-bold text-sm md:text-base">Google Meet</h4>
                    <p className="text-[#E5E5E5]/50 text-[10px] md:text-xs">Jadwalkan via Calendly</p>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}