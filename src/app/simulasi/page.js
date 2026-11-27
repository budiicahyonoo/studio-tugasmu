import PublicShell from "../../components/shared/PublicShell";
import SimulasiClient from "../../components/simulasi/SimulasiClient";
import { getPublicCatalogData } from "../../lib/publicData";
export const dynamic = "force-dynamic";
export const metadata = { title: "Simulasi harga | Studio Tugasmu" };
export default async function SimulasiPage({ searchParams }) {
  const params = await searchParams;
  const { fakultas, layanan, pengaturan, dataUnavailable } =
    await getPublicCatalogData();
  return (
    <PublicShell settings={pengaturan}>
      <div className="page-intro">
        <h1>Rincikan tugas, lihat biayanya.</h1>
        <p>
          Pilih layanan, jumlah atau paket, lalu tinjau harga dan benefit
          sebelum menghubungi admin.
        </p>
      </div>
      <SimulasiClient
        fakultasList={fakultas}
        layananList={layanan.filter((item) => item.nama !== "Cek Turnitin")}
        nomorWhatsApp={pengaturan.nomorWhatsApp}
        initialLayananId={
          typeof params?.layanan === "string" ? params.layanan : ""
        }
        initialJenjang={params?.jenjang === "SISWA" ? "SISWA" : "MAHASISWA"}
        dataUnavailable={dataUnavailable}
      />
    </PublicShell>
  );
}
