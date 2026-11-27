"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, User } from "lucide-react";
import { loginAdmin } from "../../../actions/auth";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await loginAdmin(formData);

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-[#F7F8FA] p-4 sm:p-6">
      <div className="surface-card w-full max-w-md p-6 sm:p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[#DCE4EB] bg-[#E8EEF4]">
            <Lock aria-hidden="true" className="h-7 w-7 text-[#16324F]" />
          </div>
          <h1 className="text-2xl font-bold text-[#16324F]">Masuk Admin</h1>
          <p className="mt-1.5 text-sm text-[#526277]">
            Kelola tarif, paket, pesanan, dan pengaturan Studio Tugasmu.
          </p>
        </div>

        {error && (
          <div
            id="login-error"
            role="alert"
            className="mb-5 rounded-lg border border-[#B42318] bg-[#FEF3F2] p-3 text-center text-sm font-medium text-[#8F1D14]"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-username" className="mb-1.5 block text-sm font-semibold text-[#172B40]">
              Username
            </label>
            <div className="relative">
              <User aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#526277]" />
              <input
                id="admin-username"
                type="text"
                name="username"
                autoComplete="username"
                required
                placeholder="Masukkan username"
                className="field-input pl-10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-[#172B40]">
              Password
            </label>
            <div className="relative">
              <Lock aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#526277]" />
              <input
                id="admin-password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="Masukkan password"
                className="field-input pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary mt-2 w-full py-3"
          >
            <span aria-live="polite">{isLoading ? "Memeriksa..." : "Masuk Dashboard"}</span>
          </button>
        </form>

        <div className="mt-6 border-t border-[#DCE4EB] pt-4 text-center">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[#116471] hover:underline"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            <span>Kembali ke beranda</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
