"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="beranda"
      className="border-b border-[#DCE4EB] bg-[#F7F8FA] px-4 py-12 sm:px-6 sm:py-16 lg:py-20"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <h1 className="text-[clamp(1.875rem,3.6vw,3rem)] font-bold leading-[1.15] tracking-tight text-[#16324F]">
            Simulasi harga tugas akademik yang jelas sebelum kamu memesan.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#526277] sm:text-lg">
            Pilih fakultas Saintek atau Soshum, tentukan layanan atau paket, rapikan deskripsi
            tugas, lalu kirim pesanan langsung ke WhatsApp admin dalam hitungan detik.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/simulasi" className="btn-primary px-6 py-3">
              <span>Hitung Harga Sekarang</span>
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link href="/layanan" className="btn-secondary px-6 py-3">
              Lihat Katalog Layanan
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5 text-sm font-medium text-[#526277]">
            <span className="inline-flex items-center gap-2">
              <Clock aria-hidden="true" size={16} className="text-[#116471]" />
              <span>Estimasi standar 1x24 jam</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 aria-hidden="true" size={16} className="text-[#116471]" />
              <span>Tanpa biaya kilat tambahan</span>
            </span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="surface-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#DCE4EB] bg-[#16324F] px-5 py-4 text-white">
              <div>
                <div className="text-xs font-medium text-white/85">Ringkasan Tarif Dasar</div>
                <div className="text-base font-bold">Soshum & Saintek</div>
              </div>
              <span className="rounded-md bg-[#F4B860] px-2.5 py-1 text-xs font-bold text-[#16324F]">
                Angka Pasti
              </span>
            </div>

            <div className="divide-y divide-[#DCE4EB] px-5 py-2 text-sm">
              <div className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <div className="font-semibold text-[#172B40]">Artikel, Paper, Makalah</div>
                  <div className="text-xs text-[#526277]">Hitungan per lembar</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-bold text-[#16324F]">Rp3.000 - Rp4.000</div>
                  <div className="text-xs font-medium text-[#116471]">Soshum / Saintek</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <div className="font-semibold text-[#172B40]">Slide Presentasi (PPT)</div>
                  <div className="text-xs text-[#526277]">Hitungan per slide</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-bold text-[#16324F]">Rp3.000 - Rp4.000</div>
                  <div className="text-xs font-medium text-[#116471]">Soshum / Saintek</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <div className="font-semibold text-[#172B40]">Skripsi Sempro & Full</div>
                  <div className="text-xs text-[#526277]">Bab 1-3 atau Bab 1-5</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-bold text-[#16324F]">Rp2jt / Rp5jt</div>
                  <div className="text-xs font-medium text-[#116471]">Harga paket total</div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#DCE4EB] bg-[#F7F8FA] px-5 py-3.5">
              <Link
                href="/simulasi"
                className="flex min-h-11 items-center justify-between text-sm font-bold text-[#116471] hover:underline"
              >
                <span>Buka kalkulator simulasi lengkap</span>
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
