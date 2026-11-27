"use client";

import { useState } from "react";
import { tambahUlasan } from "../../actions/ulasan";
import DatabaseUnavailable from "../shared/DatabaseUnavailable";
import { useToast } from "../shared/ToastProvider";

export default function Reviews({ ulasanDb = [], dataUnavailable = false }) {
  const { showToast } = useToast();
  const [submissionState, setSubmissionState] = useState("idle");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmissionState("submitting");

    try {
      const res = await tambahUlasan(new FormData(form));
      if (res?.ok === false) {
        setSubmissionState("error");
        showToast(res.error || "Ulasan tidak valid.", "error");
        return;
      }
      form.reset();
      setSubmissionState("success");
      showToast("Ulasan terkirim dan menunggu persetujuan admin.", "success");
    } catch (error) {
      console.error("Gagal mengirim ulasan", error);
      setSubmissionState("error");
      showToast("Ulasan gagal dikirim. Coba lagi.", "error");
    }
  };

  return (
    <section id="ulasan" className="bg-white px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h2 className="text-[clamp(1.5rem,2.5vw,2rem)] font-bold text-[#16324F]">
            Ulasan Pelanggan
          </h2>
          <p className="mt-2 text-sm text-[#526277] sm:text-base">
            Seluruh ulasan yang tampil telah ditinjau oleh admin sebelum dipublikasikan.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            {dataUnavailable ? (
              <DatabaseUnavailable dataLabel="Data ulasan" />
            ) : ulasanDb.length === 0 ? (
              <div
                role="status"
                className="rounded-2xl border border-[#DCE4EB] bg-[#F7F8FA] p-6 text-sm text-[#526277]"
              >
                <p className="font-semibold text-[#172B40]">Belum ada ulasan yang dipublikasikan.</p>
                <p className="mt-1">
                  Jika pernah menggunakan layanan Studio Tugasmu, kamu dapat mengirim ulasan melalui
                  formulir di samping.
                </p>
              </div>
            ) : (
              ulasanDb.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-[#DCE4EB] bg-[#F7F8FA] p-5"
                >
                  <p className="text-sm leading-relaxed text-[#172B40]">
                    &ldquo;{review.teks}&rdquo;
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#DCE4EB] pt-3">
                    <span className="text-sm font-bold text-[#16324F]">
                      {review.nama}
                    </span>
                    <span className="text-xs font-semibold text-[#116471]">
                      {review.role}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="surface-card p-6 lg:sticky lg:top-24 lg:col-span-5">
            <h3 className="text-lg font-bold text-[#16324F]">Kirim Ulasan</h3>

            {submissionState === "success" && (
              <p
                role="status"
                className="mt-4 rounded-lg border border-[#167D8D] bg-[#E8F4F6] p-3 text-sm text-[#172B40]"
              >
                Ulasan terkirim dan menunggu peninjauan admin.
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="review-name"
                  className="mb-1.5 block text-sm font-semibold text-[#172B40]"
                >
                  Nama
                </label>
                <input
                  id="review-name"
                  type="text"
                  name="nama"
                  autoComplete="name"
                  required
                  placeholder="Nama panggilan atau inisial"
                  className="field-input"
                />
              </div>

              <div>
                <label
                  htmlFor="review-role"
                  className="mb-1.5 block text-sm font-semibold text-[#172B40]"
                >
                  Fakultas atau peran
                </label>
                <input
                  id="review-role"
                  type="text"
                  name="role"
                  required
                  placeholder="Contoh: Mahasiswa Hukum"
                  className="field-input"
                />
              </div>

              <div>
                <label
                  htmlFor="review-text"
                  className="mb-1.5 block text-sm font-semibold text-[#172B40]"
                >
                  Ulasan
                </label>
                <textarea
                  id="review-text"
                  name="teks"
                  required
                  rows={4}
                  placeholder="Ceritakan pengalamanmu menggunakan layanan Studio Tugasmu"
                  className="field-input resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={submissionState === "submitting"}
                className="btn-primary w-full py-3"
              >
                {submissionState === "submitting" ? "Mengirim..." : "Kirim Ulasan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
