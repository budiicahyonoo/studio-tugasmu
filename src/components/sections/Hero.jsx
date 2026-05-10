"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Monitor, BookOpen, PenTool, Star, Users, CheckCircle, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    // DITAMBAHKAN pt-32 md:pt-40 AGAR TIDAK MEPET NAVBAR
    <section id="beranda" className="min-h-screen flex flex-col items-center justify-center px-6 pt-32 md:pt-40 pb-20 relative bg-[#000000] overflow-hidden">
      
      {/* Efek Cahaya Emas Tipis di Background Utama */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#FCA311]/10 rounded-full blur-[130px] pointer-events-none" />

      {/* --- ANIMASI BACKGROUND (KOMPUTER & BUKU MELAYANG) --- */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
        className="absolute top-1/4 left-[5%] md:left-[15%] text-[#FCA311]/10 hidden md:block"
      >
        <Monitor size={80} />
      </motion.div>

      <motion.div 
        animate={{ y: [0, 25, 0], rotate: [0, -10, 0] }} 
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} 
        className="absolute top-1/3 right-[5%] md:right-[15%] text-[#FCA311]/10 hidden md:block"
      >
        <BookOpen size={70} />
      </motion.div>

      <motion.div 
        animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }} 
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} 
        className="absolute bottom-1/4 left-[10%] text-[#FCA311]/10 hidden md:block"
      >
        <PenTool size={55} />
      </motion.div>
      {/* ---------------------------------------------------- */}

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center"
      >
        
        {/* --- HOOK PALING MENOHOK (BADGE ANIMASI EMAS) --- */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-[#14213D]/80 border border-[#FCA311]/50 px-5 py-2.5 rounded-full mb-8 shadow-[0_0_20px_rgba(252,163,17,0.25)] backdrop-blur-md"
        >
          <CheckCircle className="text-[#FCA311] animate-pulse" size={20} />
          <span className="text-[#FCA311] text-sm md:text-base font-extrabold tracking-wide uppercase">
            Garansi Revisi Gratis 1x Dalam 24 Jam!
          </span>
        </motion.div>

        {/* --- TEKS UTAMA --- */}
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-[#FFFFFF] leading-tight">
          Selesaikan Tugasmu dengan <br className="hidden md:block" />
          <span className="text-[#FCA311]">
            Cepat & Profesional
          </span>
        </h1>
        <p className="text-lg md:text-xl text-[#E5E5E5]/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          Platform jasa pengerjaan tugas nomor satu. Solusi aman, tepat waktu, dan berkualitas untuk siswa hingga mahasiswa.
        </p>
        
        {/* --- TOMBOL CTA --- */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full">
          <Link href="#cara-order" className="w-full sm:w-auto bg-[#FCA311] hover:bg-[#FCA311]/80 text-[#000000] font-bold py-3.5 px-8 rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(252,163,17,0.3)]">
            Hitung Estimasi Harga
          </Link>
          <Link href="#layanan" className="w-full sm:w-auto bg-[#14213D]/50 hover:bg-[#14213D] border border-[#FCA311]/30 text-[#FFFFFF] font-semibold py-3.5 px-8 rounded-full transition-all backdrop-blur-sm">
            Lihat Layanan
          </Link>
        </div>

        {/* --- CARD SOCIAL PROOF --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="w-full max-w-4xl bg-[#14213D]/40 backdrop-blur-md border border-[#E5E5E5]/10 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden"
        >
          {/* Garis Kilau di Atas Card */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FCA311]/50 to-transparent"></div>

          {/* Kolom 1: Rating & Klien */}
          <div className="flex items-center gap-4 text-left">
            <div>
              <div className="flex gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-[#FCA311] fill-[#FCA311]" />
                ))}
              </div>
              <p className="text-[#FFFFFF] font-bold text-xl leading-tight">
                1,200+ <span className="text-[#E5E5E5]/70 text-sm font-normal">Klien Terbantu</span>
              </p>
            </div>
          </div>

          {/* Garis Pemisah (Desktop) */}
          <div className="hidden md:block w-px h-12 bg-[#E5E5E5]/10"></div>

          {/* Kolom 2: Keunggulan Utama */}
          <div className="flex items-center gap-3">
            <div className="bg-[#FCA311]/10 p-2.5 rounded-lg border border-[#FCA311]/20">
              <Users className="text-[#FCA311]" size={22} />
            </div>
            <div className="text-left">
              <p className="text-[#FFFFFF] font-bold text-base">100% Rahasia</p>
              <p className="text-[#E5E5E5]/70 text-xs">Data & Privasi Aman</p>
            </div>
          </div>

          {/* Garis Pemisah (Desktop) */}
          <div className="hidden md:block w-px h-12 bg-[#E5E5E5]/10"></div>

          {/* Kolom 3: Logo Kolaborasi / Kepercayaan (Placeholder Elegan) */}
          <div className="flex items-center gap-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
            {/* Logo 1 */}
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={20} className="text-[#FCA311]" />
              <span className="text-[#FFFFFF] font-bold text-sm tracking-wider uppercase">Terverifikasi</span>
            </div>
            {/* Logo 2 */}
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <span className="text-[#FFFFFF] font-black text-lg italic tracking-tighter">TopRated.</span>
            </div>
          </div>

        </motion.div>
        
      </motion.div>
    </section>
  );
}