import PublicShell from "../../components/shared/PublicShell";
import ReviewGallery from "../../components/sections/ReviewGallery";
import DatabaseUnavailable from "../../components/shared/DatabaseUnavailable";
import { getPublicContent, getSiteSettings } from "../../lib/publicData";
export const dynamic = "force-dynamic";
export const metadata = { title: "Galeri ulasan | Studio Tugasmu" };
export default async function UlasanPage() {
  const [settings, content] = await Promise.all([
    getSiteSettings(),
    getPublicContent(),
  ]);
  return (
    <PublicShell settings={settings}>
      <div className="page-intro">
        <h1>Catatan dari pelanggan</h1>
        <p>
          Galeri ulasan yang dipublikasikan admin, dikelompokkan berdasarkan
          label layanan.
        </p>
      </div>
      {content.dataUnavailable ? (
        <DatabaseUnavailable dataLabel="Galeri ulasan" />
      ) : (
        <ReviewGallery items={content.galeri} />
      )}
    </PublicShell>
  );
}
