"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Efek transparan berubah jadi glass saat discroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "glass-card rounded-none border-t-0 border-x-0 !bg-slate-950/80 py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white tracking-wide">
          Studio<span className="text-sky-400">Tugasmu</span>
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link href="#beranda" className="hover:text-sky-400 transition-colors">Beranda</Link>
          <Link href="#cara-order" className="hover:text-sky-400 transition-colors">Cara Order</Link>
          <Link href="#layanan" className="hover:text-sky-400 transition-colors">Layanan</Link>
          <Link href="#portfolio" className="hover:text-sky-400 transition-colors">Portfolio</Link>
          <Link href="#ulasan" className="hover:text-sky-400 transition-colors">Ulasan</Link>
        </div>

        {/* Tombol CTA */}
        <div className="hidden md:block">
          <Link href="#cara-order" className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:border-sky-400">
            Mulai Konsultasi
          </Link>
        </div>
      </div>
    </nav>
  );
}