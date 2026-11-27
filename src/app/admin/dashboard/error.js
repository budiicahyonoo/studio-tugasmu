"use client";

import { useEffect } from "react";

export default function Error({ error, unstable_retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-6 py-16">
      <section role="alert" className="surface-card max-w-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-[#16324F]">
          Data dashboard belum dapat dimuat
        </h1>
        <p className="mt-3 text-sm text-[#526277]">
          Gagal memuat data dashboard. Coba muat ulang halaman.
          {process.env.NODE_ENV === "development" &&
            " Jika terminal menunjukkan error Prisma, periksa DATABASE_URL di file .env untuk Neon PostgreSQL dan jalankan ulang npm run dev."}
        </p>
        <button
          type="button"
          onClick={unstable_retry}
          className="btn-primary mt-6"
        >
          Coba lagi
        </button>
      </section>
    </main>
  );
}
