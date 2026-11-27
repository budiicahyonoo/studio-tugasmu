"use client";

export default function DatabaseUnavailable({ dataLabel }) {
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div
      role="alert"
      className="rounded-xl border border-[#B42318] bg-[#FEF3F2] p-5 text-[#8F1D14]"
    >
      <h3 className="font-semibold">{dataLabel} belum dapat dimuat.</h3>
      <p className="mt-2 text-sm">
        {isDevelopment
          ? "Periksa konfigurasi DATABASE_URL untuk Neon PostgreSQL di file .env, lalu jalankan ulang server."
          : "Coba muat ulang halaman beberapa saat lagi."}
      </p>
    </div>
  );
}
