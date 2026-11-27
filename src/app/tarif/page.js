import Link from "next/link";
import PublicShell from "../../components/shared/PublicShell";
import DatabaseUnavailable from "../../components/shared/DatabaseUnavailable";
import { getPublicCatalogData } from "../../lib/publicData";
import { formatRupiah } from "../../lib/calculateEstimate";
export const dynamic = "force-dynamic";
export const metadata = { title: "Tarif dan paket | Studio Tugasmu" };
export default async function TarifPage({ searchParams }) {
  const params = await searchParams;
  const { layanan, kategori, pengaturan, dataUnavailable } =
    await getPublicCatalogData();
  const selected =
    kategori.find((item) => item.id === params?.kategori)?.id || "";
  const filtered = layanan.filter(
    (item) =>
      item.nama !== "Cek Turnitin" && (!selected || item.kategori === selected),
  );
  return (
    <PublicShell settings={pengaturan}>
      <div className="page-intro">
        <h1>Ketahui biaya dan cakupannya</h1>
        <p>
          Harga per lembar, per slide, atau per paket sesuai kelompok fakultas.
          Harga paket adalah total, bukan tambahan dari paket lain.
        </p>
      </div>
      <nav aria-label="Filter kategori" className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/tarif"
          aria-current={!selected ? "page" : undefined}
          className={!selected ? "btn-primary" : "btn-secondary"}
        >
          Semua
        </Link>
        {kategori.map((item) => (
          <Link
            key={item.id}
            href={`/tarif?kategori=${item.id}`}
            aria-current={selected === item.id ? "page" : undefined}
            className={selected === item.id ? "btn-primary" : "btn-secondary"}
          >
            {item.nama}
          </Link>
        ))}
      </nav>
      {dataUnavailable ? (
        <DatabaseUnavailable dataLabel="Tarif layanan" />
      ) : !filtered.length ? (
        <p className="empty-state">
          Tarif belum dipublikasikan untuk kategori ini.
        </p>
      ) : (
        <div className="space-y-10">
          {filtered.map((item) => (
            <article key={item.id} className="border-t border-[#DCE4EB] pt-6">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#16324F]">
                    {item.nama}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[#526277]">
                    {item.deskripsi}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#116471]">
                    Estimasi selesai: {item.estimasiSelesai}
                  </p>
                </div>
                <Link
                  href={`/simulasi?layanan=${item.id}`}
                  className="btn-secondary self-start"
                >
                  Simulasikan {item.nama}
                </Link>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {["SOSHUM", "SAINTEK"].map((group) => (
                  <div
                    key={group}
                    className="rounded-xl border border-[#DCE4EB] bg-white p-5"
                  >
                    <h3 className="font-bold">
                      {group === "SAINTEK" ? "Saintek" : "Soshum"}
                    </h3>
                    {item.tipeHitung === "PER_PAKET" ? (
                      item.paket.filter((p) => p.kelompok === group).length ? (
                        item.paket
                          .filter((p) => p.kelompok === group)
                          .map((p) => (
                            <div
                              key={p.id}
                              className="mt-4 border-t border-[#DCE4EB] pt-4"
                            >
                              <h4 className="text-sm font-bold">{p.nama}</h4>
                              <p className="mt-2 text-xl font-extrabold text-[#16324F]">
                                {formatRupiah(p.harga)}
                              </p>
                              {p.deskripsi && (
                                <p className="mt-2 text-sm leading-6 text-[#526277]">
                                  {p.deskripsi}
                                </p>
                              )}
                              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#526277]">
                                {p.benefit.map((b) => (
                                  <li key={b.id}>{b.teks}</li>
                                ))}
                              </ul>
                            </div>
                          ))
                      ) : (
                        <p className="mt-4 text-sm text-[#526277]">
                          Harga paket belum diatur admin.
                        </p>
                      )
                    ) : (
                      <p className="mt-4 text-xl font-extrabold text-[#16324F]">
                        {item.tarif.some((t) => t.kelompok === group) ? (
                          <>
                            {formatRupiah(
                              item.tarif.find((t) => t.kelompok === group)
                                .hargaPerUnit,
                            )}{" "}
                            <span className="text-sm font-medium">
                              /{" "}
                              {item.tipeHitung === "PER_SLIDE"
                                ? "slide"
                                : "lembar"}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-medium">
                            Tarif belum diatur admin.
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {!!item.benefit.length && (
                <div className="mt-5">
                  <h3 className="font-bold">Benefit layanan</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#526277]">
                    {item.benefit.map((b) => (
                      <li key={b.id}>{b.teks}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </PublicShell>
  );
}
