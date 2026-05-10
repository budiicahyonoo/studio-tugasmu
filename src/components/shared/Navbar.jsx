"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Video, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Efek navbar saat discroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const waTemplate = `Halo Admin Studio Tugasmu!\n\nNama saya : ...\nAsal Kampus/Sekolah : ...\n\nSaya ingin konsultasi mengenai : ...`;
  const encodedWaText = encodeURIComponent(waTemplate);
  const waLink = `https://wa.me/6283151195556?text=${encodedWaText}`;
  const calendlyLink = "https://calendly.com/stackplustudio"; 

  return (
    <>
      {/* NAVBAR FULL WIDTH DENGAN PENYESUAIAN MOBILE */}
      <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 rounded-b-3xl md:rounded-b-[2.5rem] ${
        isScrolled 
          ? "bg-[#14213D]/95 backdrop-blur-md border-b border-[#FCA311]/30 shadow-[0_10px_30px_rgba(0,0,0,0.4)] py-3 md:py-4" 
          : "bg-gradient-to-b from-[#000000]/80 to-transparent md:bg-transparent border-b border-transparent py-4 md:py-6"
      }`}>
        {/* Ubah padding mobile (px-4) agar tidak mepet/terpotong */}
        <div className="w-full max-w-7xl mx-auto px-4 md:px-12 flex justify-between items-center">
          
          {/* Logo Gambar (Lebih kecil di mobile biar muat) */}
          <Link href="/" className="flex-shrink-0 hover:scale-105 transition-transform">
            <img src="/logo.png" alt="Studio Tugasmu" className="h-7 md:h-10 w-auto object-contain rounded-md" />
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#E5E5E5]">
            <Link href="#beranda" className="hover:text-[#FCA311] transition-colors">Beranda</Link>
            <Link href="#cara-order" className="hover:text-[#FCA311] transition-colors">Cara Order</Link>
            <Link href="#layanan" className="hover:text-[#FCA311] transition-colors">Layanan</Link>
            <Link href="#portfolio" className="hover:text-[#FCA311] transition-colors">Portfolio</Link>
            <Link href="#ulasan" className="hover:text-[#FCA311] transition-colors">Ulasan</Link>
          </div>

          {/* Tombol CTA Buka Modal (Desktop) */}
          <div className="hidden md:block flex-shrink-0">
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#000000] px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-[0_0_15px_rgba(252,163,17,0.3)]"
            >
              Mulai Konsultasi
            </button>
          </div>

          {/* Tombol Mobile (Ditambahkan flex-shrink-0 agar tidak terpotong) */}
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="md:hidden flex-shrink-0 bg-[#FCA311] text-[#000000] px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold shadow-lg"
          >
            Konsultasi
          </button>
        </div>
      </nav>

      {/* POPUP MODAL KONSULTASI (Tetap sama) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#14213D] border border-[#FCA311]/30 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-[0_0_40px_rgba(252,163,17,0.15)] z-10"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-[#E5E5E5]/50 hover:text-[#FCA311] transition-colors"
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl font-bold text-[#FFFFFF] mb-2">Pilih Jalur Konsultasi</h3>
              <p className="text-[#E5E5E5]/70 text-sm mb-8">Pilih platform yang paling nyaman untuk berdiskusi dengan tim kami.</p>

              <div className="flex flex-col gap-4">
                <a 
                  href={waLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-[#000000]/50 hover:bg-[#FCA311]/10 border border-[#E5E5E5]/10 hover:border-[#FCA311] p-4 rounded-xl transition-all group"
                >
                  <div className="bg-[#25D366]/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <MessageCircle className="text-[#25D366]" size={28} />
                  </div>
                  <div>
                    <h4 className="text-[#FFFFFF] font-bold">Konsultasi via WhatsApp</h4>
                    <p className="text-[#E5E5E5]/50 text-xs mt-1">Chat langsung dengan tim (Fast Respon)</p>
                  </div>
                </a>

                <a 
                  href={calendlyLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-[#000000]/50 hover:bg-[#FCA311]/10 border border-[#E5E5E5]/10 hover:border-[#FCA311] p-4 rounded-xl transition-all group"
                >
                  <div className="bg-[#4285F4]/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <Video className="text-[#4285F4]" size={28} />
                  </div>
                  <div>
                    <h4 className="text-[#FFFFFF] font-bold">Pesan Jadwal G-Meet</h4>
                    <p className="text-[#E5E5E5]/50 text-xs mt-1">Meeting tatap muka virtual via Calendly</p>
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