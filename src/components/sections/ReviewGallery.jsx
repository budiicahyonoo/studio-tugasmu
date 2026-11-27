"use client";
import { useState } from "react";
export default function ReviewGallery({ items }) {
  const [label, setLabel] = useState("");
  const labels = [...new Set(items.map((item) => item.label))];
  const filtered = label ? items.filter((item) => item.label === label) : items;
  return (
    <div>
      <div className="mb-7 max-w-sm">
        <label
          htmlFor="review-filter"
          className="mb-2 block text-sm font-semibold"
        >
          Filter label ulasan
        </label>
        <select
          id="review-filter"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="field-input"
        >
          <option value="">Semua label</option>
          {labels.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <p className="mb-4 text-sm text-[#526277]" role="status">
        {filtered.length} foto ulasan
      </p>
      {!filtered.length ? (
        <p className="empty-state">
          Belum ada foto ulasan yang dipublikasikan.
        </p>
      ) : (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {filtered.map((photo) => (
            <figure
              key={photo.id}
              className="mb-6 break-inside-avoid rounded-xl border border-[#DCE4EB] bg-white p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.imageUrl}
                width={photo.lebar}
                height={photo.tinggi}
                alt={`Ulasan pelanggan: ${photo.label}`}
                loading="lazy"
                className="h-auto w-full rounded-lg object-contain"
              />
              <figcaption className="px-1 pt-3 pb-1 text-sm font-semibold text-[#16324F]">
                {photo.label}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
