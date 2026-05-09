"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section id="beranda" className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-card p-10 md:p-16 text-center max-w-4xl w-full"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-white leading-tight">
          Selesaikan Tugasmu dengan <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
            Cepat & Profesional
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Platform jasa pengerjaan tugas nomor satu. Solusi aman, tepat waktu, dan berkualitas untuk siswa hingga mahasiswa.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="#cara-order" className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3.5 px-8 rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(56,189,248,0.4)]">
            Hitung Estimasi Harga
          </Link>
          <Link href="#layanan" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold py-3.5 px-8 rounded-full transition-all backdrop-blur-sm">
            Lihat Layanan
          </Link>
        </div>
      </motion.div>
    </section>
  );
}