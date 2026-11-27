"use client";
import { useId, useState } from "react";
export function Field({ name, label, type = "text", options, ...props }) {
  const id = useId();
  const Element =
    type === "textarea" ? "textarea" : options ? "select" : "input";
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      <Element
        id={id}
        name={name}
        className="field-input"
        {...(!options && type !== "textarea" ? { type } : {})}
        {...props}
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Element>
    </div>
  );
}
export function Editor({
  title,
  item,
  fields,
  save,
  remove,
  runAction,
  children,
}) {
  return (
    <details
      className="rounded-xl border border-[#DCE4EB] bg-white p-4"
      open={!item}
    >
      <summary className="flex min-h-11 items-center text-sm font-bold text-[#16324F]">
        {title}
      </summary>
      <form
        onSubmit={(event) => runAction(event, save, "Perubahan tersimpan.")}
        className="mt-4 grid gap-4 sm:grid-cols-2"
      >
        {item && <input type="hidden" name="id" value={item.id} />}
        {fields.map((field) => (
          <Field
            key={field.name}
            {...field}
            defaultValue={String(item?.[field.name] ?? field.initial ?? "")}
          />
        ))}
        {children}
        <button type="submit" className="btn-primary self-end">
          Simpan {item ? "perubahan" : "data baru"}
        </button>
      </form>
      {item && remove && (
        <form
          className="mt-3"
          onSubmit={(event) =>
            runAction(event, remove, "Data dihapus atau dinonaktifkan.")
          }
        >
          <input type="hidden" name="id" value={item.id} />
          <button type="submit" className="btn-danger">
            Hapus {title}
          </button>
        </form>
      )}
    </details>
  );
}
export function Paged({ items, render, empty = "Belum ada data.", size = 10 }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(page, totalPages);
  return (
    <div className="space-y-4">
      {!items.length ? (
        <p className="empty-state">{empty}</p>
      ) : (
        items
          .slice((current - 1) * size, current * size)
          .map((item, index) => render(item, index + (current - 1) * size))
      )}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-secondary"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
          >
            Sebelumnya
          </button>
          <p className="text-sm" role="status">
            {current} / {totalPages}
          </p>
          <button
            type="button"
            className="btn-secondary"
            disabled={current >= totalPages}
            onClick={() => setPage(current + 1)}
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
export const kelompokOptions = ["SOSHUM", "SAINTEK"].map((value) => ({
  value,
  label: value === "SOSHUM" ? "Soshum" : "Saintek",
}));
export const visibilityOptions = [
  { value: "true", label: "Ya" },
  { value: "false", label: "Tidak" },
];
