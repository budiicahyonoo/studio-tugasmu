"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DatabaseUnavailable from "../shared/DatabaseUnavailable";

export default function Portfolio({
  portfolioDb = [],
  dataUnavailable = false,
  isStandalonePage = false,
}) {
  const HeadingTag = isStandalonePage ? "h1" : "h2";

  return (
    <section
      id="portfolio"
      className="border-y border-[#DCE4EB] bg-[#F7F8FA] px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <HeadingTag
              className={
                isStandalonePage
                  ? "text-[clamp(1.875rem,3vw,2.5rem)] font-bold text-[#16324F]"
                  : "text-[clamp(1.5rem,2.5vw,2rem)] font-bold text-[#16324F]"
              }
            >
              Portofolio Karya
            </HeadingTag>
            <p className="mt-2 max-w-xl text-sm text-[#526277] sm:text-base">
              Contoh hasil pengerjaan pada kategori umum, khusus, dan PKL.
            </p>
          </div>
          {!isStandalonePage && (
            <Link
              href="/portofolio"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[#116471] hover:underline"
            >
              <span>Lihat semua portofolio</span>
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          )}
        </div>

        {dataUnavailable ? (
          <DatabaseUnavailable dataLabel="Data portofolio" />
        ) : portfolioDb.length === 0 ? (
          <div className="surface-card p-8 text-center">
            <p className="text-sm text-[#526277]">
              Belum ada karya yang ditampilkan saat ini.
            </p>
            <Link
              href="/simulasi"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[#116471] hover:underline"
            >
              Mulai simulasi harga
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {portfolioDb.map((item) => (
              <article
                key={item.id}
                className="surface-card overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#EDF2F7]">
                  <img
                    src={item.imageUrl}
                    width={640}
                    height={400}
                    alt={item.judul}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="border-t border-[#DCE4EB] p-5">
                  <span className="inline-block rounded-md bg-[#E8F4F6] px-2.5 py-1 text-xs font-semibold text-[#116471]">
                    {item.kategori}
                  </span>
                  <h3 className="mt-2.5 text-base font-bold text-[#16324F]">
                    {item.judul}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
