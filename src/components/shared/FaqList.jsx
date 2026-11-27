import Link from "next/link";
import { safeDestination } from "../../lib/validation";
export default function FaqList({ items }) {
  if (!items.length)
    return (
      <p className="empty-state">
        Pertanyaan umum belum dipublikasikan. Kamu bisa menanyakan detail
        layanan melalui WhatsApp admin.
      </p>
    );
  return (
    <div className="divide-y divide-[#DCE4EB] border-y border-[#DCE4EB]">
      {items.map((item) => (
        <details key={item.id} className="group py-2">
          <summary className="flex min-h-14 items-center justify-between gap-4 py-3 text-base font-bold text-[#16324F]">
            {item.pertanyaan}
            <span aria-hidden="true" className="text-xl group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="pb-5 text-sm leading-7 text-[#526277]">
            <p className="whitespace-pre-line">{item.jawaban}</p>
            {item.labelTombol &&
              item.tujuanTombol &&
              safeDestination(item.tujuanTombol) && (
                <Link className="btn-secondary mt-4" href={item.tujuanTombol}>
                  {item.labelTombol}
                </Link>
              )}
          </div>
        </details>
      ))}
    </div>
  );
}
