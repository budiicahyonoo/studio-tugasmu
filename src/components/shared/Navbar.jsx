"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, MessageCircle, Menu, X } from "lucide-react";

export default function Navbar({
  nomorWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6283151195556",
}) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
          mobileButtonRef.current?.focus();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const cleanWa = String(nomorWhatsApp).replace(/[^0-9]/g, "");
  const waHref = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    "Halo Admin Studio Tugasmu, saya ingin berkonsultasi mengenai layanan tugas akademik."
  )}`;

  const layananSubmenu = [
    { label: "Umum (Artikel, Paper, Makalah, PPT)", href: "/layanan?kategori=UMUM" },
    { label: "Khusus (Skripsi, Thesis, Projek)", href: "/layanan?kategori=KHUSUS" },
    { label: "PKL (Praktikum, Laporan PKL, Observasi)", href: "/layanan?kategori=PKL" },
  ];

  const linkClass = (href) => {
    const active = pathname === href;
    return `inline-flex min-h-11 items-center rounded-lg px-3 text-sm transition-colors ${
      active
        ? "bg-[#EDF2F7] font-bold text-[#16324F]"
        : "font-medium text-[#172B40] hover:bg-[#F7F8FA] hover:text-[#116471]"
    }`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#DCE4EB] bg-white">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
      >
        <Link
          href="/"
          className="inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-lg"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Image
            src="/logo.png"
            width={332}
            height={211}
            alt="Studio Tugasmu"
            priority
            className="h-8 w-auto object-contain sm:h-9"
          />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          <Link href="/" className={linkClass("/")}>
            Beranda
          </Link>

          <Link
            href="/simulasi"
            className="btn-primary mx-1 px-4 py-2"
          >
            Simulasi Harga
          </Link>

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              onClick={() => setIsDropdownOpen((open) => !open)}
              className={`inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-sm transition-colors ${
                pathname === "/layanan"
                  ? "bg-[#EDF2F7] font-bold text-[#16324F]"
                  : "font-medium text-[#172B40] hover:bg-[#F7F8FA] hover:text-[#116471]"
              }`}
            >
              <span>Layanan</span>
              <ChevronDown
                aria-hidden="true"
                size={16}
                className={`transition-transform duration-150 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 rounded-xl border border-[#DCE4EB] bg-white p-2 shadow-lg">
                {layananSubmenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm text-[#172B40] transition-colors hover:bg-[#E8F4F6] hover:text-[#116471]"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/layanan"
                  onClick={() => setIsDropdownOpen(false)}
                  className="mt-1 flex min-h-11 items-center rounded-lg border-t border-[#DCE4EB] px-3 py-2 text-sm font-bold text-[#16324F] hover:bg-[#F7F8FA]"
                >
                  Lihat semua layanan
                </Link>
              </div>
            )}
          </div>

          <Link href="/turnitin" className={linkClass("/turnitin")}>
            Cek Turnitin
          </Link>

          <Link href="/portofolio" className={linkClass("/portofolio")}>
            Portofolio
          </Link>

          <Link href="/#ulasan" className={linkClass("/#ulasan")}>
            Ulasan
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary hidden px-3.5 py-2 sm:inline-flex"
          >
            <MessageCircle aria-hidden="true" size={17} />
            <span>WhatsApp</span>
          </a>

          <button
            ref={mobileButtonRef}
            type="button"
            aria-label={isMobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#DCE4EB] px-3 text-sm font-semibold text-[#16324F] hover:bg-[#F7F8FA] lg:hidden"
          >
            {isMobileMenuOpen ? (
              <X aria-hidden="true" size={18} />
            ) : (
              <Menu aria-hidden="true" size={18} />
            )}
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="border-t border-[#DCE4EB] bg-white px-4 py-4 lg:hidden"
        >
          <div className="flex flex-col gap-1.5">
            <Link
              href="/simulasi"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-primary mb-1 w-full"
            >
              Simulasi Harga
            </Link>
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-[#172B40] hover:bg-[#F7F8FA]"
            >
              Beranda
            </Link>
            <Link
              href="/layanan"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-[#172B40] hover:bg-[#F7F8FA]"
            >
              Layanan (Umum, Khusus, PKL)
            </Link>
            <Link
              href="/turnitin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-[#172B40] hover:bg-[#F7F8FA]"
            >
              Cek Turnitin (QRIS)
            </Link>
            <Link
              href="/portofolio"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-[#172B40] hover:bg-[#F7F8FA]"
            >
              Portofolio
            </Link>
            <Link
              href="/#ulasan"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-[#172B40] hover:bg-[#F7F8FA]"
            >
              Ulasan
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary mt-2 w-full"
            >
              <MessageCircle aria-hidden="true" size={17} />
              <span>Chat WhatsApp Admin</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
