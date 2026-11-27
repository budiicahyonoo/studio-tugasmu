"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";

export default function Navbar({ nomorWhatsApp, turnitinAktif = false }) {
  const path = usePathname();
  const [mobile, setMobile] = useState(false);
  const [services, setServices] = useState(false);
  const menuButton = useRef(null);
  const servicesButton = useRef(null);
  const servicesMenu = useRef(null);
  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") {
        if (services) {
          setServices(false);
          servicesButton.current?.focus();
        }
        if (mobile) {
          setMobile(false);
          menuButton.current?.focus();
        }
      }
      if (
        event.type === "pointerdown" &&
        !servicesMenu.current?.contains(event.target)
      )
        setServices(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, [mobile, services]);
  const close = () => {
    setMobile(false);
    setServices(false);
  };
  const navLink = (href, label) => (
    <Link
      key={href}
      href={href}
      onClick={close}
      aria-current={path === href ? "page" : undefined}
      className={`nav-link ${path === href ? "nav-active" : ""}`}
    >
      {label}
    </Link>
  );
  const turnitinLabel = (
    <span>
      Turnitin{!turnitinAktif && <small className="ml-1">(segera hadir)</small>}
    </span>
  );
  return (
    <header className="sticky top-0 z-50 border-b border-[#DCE4EB] bg-white">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6"
      >
        <Link
          href="/"
          onClick={close}
          className="flex min-h-11 shrink-0 items-center gap-2"
        >
          <Image
            src="/logo.png"
            width={332}
            height={211}
            alt="Studio Tugasmu"
            priority
            className="h-10 w-auto"
          />
          <span className="text-sm font-extrabold text-[#16324F]">
            Studio
            <br />
            Tugasmu
          </span>
        </Link>
        <div className="hidden items-center xl:flex">
          {navLink("/", "Beranda")}
          {navLink("/simulasi", "Simulasi")}
          <div ref={servicesMenu} className="relative">
            <button
              ref={servicesButton}
              aria-expanded={services}
              aria-controls="service-nav"
              onClick={() => setServices(!services)}
              className={`nav-link gap-1 ${["/layanan", "/tarif"].includes(path) ? "nav-active" : ""}`}
            >
              Layanan
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            {services && (
              <div
                id="service-nav"
                className="absolute top-full left-0 mt-2 grid w-44 rounded-xl border border-[#DCE4EB] bg-white p-2 shadow-lg"
              >
                {navLink("/layanan", "Layanan")}
                {navLink("/tarif", "Tarif")}
              </div>
            )}
          </div>
          {navLink("/turnitin", turnitinLabel)}
          {navLink("/ulasan", "Ulasan")}
          {navLink("/faq", "FAQ")}
        </div>
        <div className="flex items-center gap-2">
          {nomorWhatsApp && (
            <a
              className="btn-secondary hidden sm:inline-flex"
              href={`https://wa.me/${String(nomorWhatsApp).replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          )}
          <button
            ref={menuButton}
            aria-expanded={mobile}
            aria-controls="mobile-nav"
            onClick={() => setMobile(!mobile)}
            className="btn-secondary px-3 xl:hidden"
          >
            {mobile ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <Menu size={18} aria-hidden="true" />
            )}
            Menu
          </button>
        </div>
      </nav>
      {mobile && (
        <nav
          id="mobile-nav"
          aria-label="Navigasi ponsel"
          className="grid max-h-[75dvh] overflow-y-auto border-t border-[#DCE4EB] px-4 py-3 xl:hidden"
        >
          {navLink("/", "Beranda")}
          {navLink("/simulasi", "Simulasi")}
          {navLink("/layanan", "Layanan")}
          {navLink("/tarif", "Tarif")}
          {navLink("/turnitin", turnitinLabel)}
          {navLink("/ulasan", "Ulasan")}
          {navLink("/faq", "FAQ")}
          {nomorWhatsApp && (
            <a
              className="btn-primary mt-2"
              href={`https://wa.me/${String(nomorWhatsApp).replace(/\D/g, "")}`}
            >
              Chat WhatsApp admin
            </a>
          )}
        </nav>
      )}
    </header>
  );
}
