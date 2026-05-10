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
  const calendlyLink = "https://calendly.com/budicahyono-dev/new-meeting";

  const navLinks = [
    { name: "Beranda", href: "#beranda" },
    { name: "Cara Order", href: "#cara-order" },
    { name: "Layanan", href: "#layanan" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Ulasan", href: "#ulasan" },
  ];

  return (
    <>
      {/* NAVBAR: Selalu menyala menggunakan bg-[#14213D]/70 dan backdrop-blur-xl sejak awal */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 rounded-b-[2rem] md:rounded-b-[3rem] bg-[#14213D]/70 backdrop-blur-xl border-b border-[#FCA311]/20 shadow-2xl py-3 md:py-4`}>
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          
          {/* Logo Gambar (Tetap Dipertahankan) */}
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
            <button onClick={() => setIsModalOpen(true)} className="bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#000000] px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg">
              Mulai Konsultasi
            </button>
          </div>

          {/* Tombol Burger Mobile */}
          <div className="md:hidden flex items-center z-50">
             <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#FCA311] p-1">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
          </div>
        </div>

        {/* ISI MENU BURGER */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden overflow-hidden bg-[#14213D]/90 backdrop-blur-xl">
              <div className="flex flex-col px-8 py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="flex justify-between items-center text-[#E5E5E5] text-lg font-medium border-b border-[#E5E5E5]/10 pb-4">
                    {link.name} <ChevronRight size={20} className="text-[#FCA311]" />
                  </Link>
                ))}
                <button onClick={() => { setIsModalOpen(true); setIsMenuOpen(false); }} className="w-full bg-[#FCA311] text-[#000000] py-4 rounded-2xl font-bold mt-4 shadow-xl">
                  Konsultasi Sekarang
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Modal Konsultasi */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-[#14213D] border border-[#FCA311]/30 rounded-3xl p-8 w-[95%] max-w-md z-10">
              <h3 className="text-2xl font-bold text-white mb-2">Pilih Jalur Diskusi</h3>
              <div className="flex flex-col gap-4 mt-6">
                <a href={waLink} target="_blank" className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-[#FCA311] transition-all">
                  <MessageCircle className="text-[#25D366]" size={28} />
                  <span className="text-white font-bold">WhatsApp Chat</span>
                </a>
                <a href={calendlyLink} target="_blank" className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-[#FCA311] transition-all">
                  <Video className="text-[#4285F4]" size={28} />
                  <span className="text-white font-bold">Google Meet</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}