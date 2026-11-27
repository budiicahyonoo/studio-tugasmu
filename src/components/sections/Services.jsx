"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DatabaseUnavailable from "../shared/DatabaseUnavailable";
import { formatRupiah } from "../../lib/calculateEstimate";

const CATEGORIES = [
  {
    key: "UMUM",
    label: "Umum",
    description: "Artikel, paper, makalah, dan slide presentasi (PPT) dihitung per lembar atau slide.",
  },
  {
    key: "KHUSUS",
    label: "Khusus",
    description: "Pendampingan skripsi, tesis, dan projek dengan pilihan cakupan paket tetap.",
  },
  {
    key: "PKL",
    label: "PKL & Praktikum",
    description: "Satu paket lengkap untuk laporan praktikum, laporan PKL, dan observasi.",
  },
];

export default function Services({ layananDb = [], dataUnavailable = false }) {
  const [activeTab, setActiveTab] = useState("UMUM");
  const activeMeta = CATEGORIES.find((c) => c.key === activeTab) || CATEGORIES[0];
  const filteredItems = layananDb.filter((item) => item.kategori === activeTab);

  return (
    <section id="layanan" className="bg-white px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 border-b border-[#DCE4EB] pb-6 md:flex-row md:items-end">
          <div>
            <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-bold text-[#16324F]">
              Katalog Layanan & Tarif
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[#526277] sm:text-base">
              Pilih kategori untuk meninjau tarif per kelompok fakultas sebelum melakukan simulasi.
            </p>
          </div>
          <Link
            href="/layanan"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[#116471] hover:underline"
          >
            <span>Lihat semua kategori</span>
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>

        {dataUnavailable ? (
          <div className="mt-8">
            <DatabaseUnavailable dataLabel="Data layanan" />
          </div>
        ) : (
          <div className="mt-8">
            <div
              role="tablist"
              aria-label="Kategori layanan"
              className="flex flex-wrap gap-2"
            >
              {CATEGORIES.map((cat) => {
                const isSelected = activeTab === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveTab(cat.key)}
                    className={`min-h-11 rounded-xl border px-5 text-sm font-semibold transition-colors ${
                      isSelected
                        ? "border-[#16324F] bg-[#16324F] text-white"
                        : "border-[#DCE4EB] bg-[#F7F8FA] text-[#172B40] hover:border-[#167D8D] hover:text-[#116471]"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-sm text-[#526277]">{activeMeta.description}</p>

            {filteredItems.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-[#DCE4EB] bg-[#F7F8FA] p-6 text-sm text-[#526277]">
                Belum ada layanan pada kategori ini.
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-[#DCE4EB] bg-white">
                <div className="divide-y divide-[#DCE4EB]">
                  {filteredItems.map((item) => {
                    const soshumTarif = item.tarif?.find((t) => t.kelompok === "SOSHUM");
                    const saintekTarif = item.tarif?.find((t) => t.kelompok === "SAINTEK");
                    const unitSuffix = item.tipeHitung === "PER_SLIDE" ? "slide" : "lembar";
                    const soshumPakets = (item.paket || []).filter((p) => p.kelompok === "SOSHUM");

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-[#F7F8FA] sm:flex-row sm:items-center"
                      >
                        <div className="max-w-xl">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="text-base font-bold text-[#16324F]">{item.nama}</h3>
                            <span className="rounded-md bg-[#E8F4F6] px-2.5 py-0.5 text-xs font-semibold text-[#116471]">
                              {item.estimasiSelesai}
                            </span>
                          </div>
                          {item.deskripsi && (
                            <p className="mt-1.5 text-sm leading-relaxed text-[#526277]">
                              {item.deskripsi}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
                          <div className="text-left sm:text-right">
                            {item.tipeHitung === "PER_PAKET" ? (
                              <div className="space-y-0.5 text-xs">
                                {soshumPakets.length > 0 ? (
                                  soshumPakets.map((p) => (
                                    <div key={p.id} className="text-[#172B40]">
                                      <span className="text-[#526277]">{p.nama}:</span>{" "}
                                      <span className="font-bold text-[#16324F]">
                                        {formatRupiah(p.harga)}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <span className="font-semibold text-[#16324F]">Paket tetap</span>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm">
                                <div className="font-bold text-[#16324F]">
                                  Soshum {formatRupiah(soshumTarif?.hargaPerUnit || 0)} / {unitSuffix}
                                </div>
                                <div className="text-xs text-[#526277]">
                                  Saintek {formatRupiah(saintekTarif?.hargaPerUnit || 0)} / {unitSuffix}
                                </div>
                              </div>
                            )}
                          </div>

                          <Link
                            href={`/simulasi?layanan=${item.id}`}
                            className="inline-flex min-h-11 items-center rounded-xl border border-[#167D8D] bg-white px-4 text-xs font-bold text-[#116471] transition-colors hover:bg-[#16324F] hover:border-[#16324F] hover:text-white"
                          >
                            Simulasikan
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
