import PublicShell from "../../components/shared/PublicShell";
import TurnitinClient from "../../components/turnitin/TurnitinClient";
import { getPublicCatalogData } from "../../lib/publicData";
import DatabaseUnavailable from "../../components/shared/DatabaseUnavailable";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Cek Turnitin dan lacak pesanan | Studio Tugasmu",
};
export default async function TurnitinPage() {
  const { layanan, pengaturan, dataUnavailable } = await getPublicCatalogData();
  const service = layanan.find((item) => item.nama === "Cek Turnitin");
  const packages = (service?.paket || [])
    .filter((item) => item.kelompok === "SOSHUM")
    .map((item) => ({
      ...item,
      estimasiSelesai: pengaturan.turnitinEstimasiSelesai,
    }));
  return (
    <PublicShell settings={pengaturan}>
      <div className="page-intro">
        <h1>Cek Turnitin</h1>
        <p>
          Pilih paket, unggah dokumen, isi kontak, lalu bayar QRIS. Pembayaran
          diverifikasi admin dan hasil diberikan sebagai PDF.
        </p>
      </div>
      {dataUnavailable ? (
        <DatabaseUnavailable dataLabel="Layanan Turnitin" />
      ) : (
        <TurnitinClient settings={pengaturan} packages={packages} />
      )}
    </PublicShell>
  );
}
