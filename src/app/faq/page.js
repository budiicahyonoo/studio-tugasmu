import PublicShell from "../../components/shared/PublicShell";
import FaqList from "../../components/shared/FaqList";
import DatabaseUnavailable from "../../components/shared/DatabaseUnavailable";
import { getPublicContent, getSiteSettings } from "../../lib/publicData";
export const dynamic = "force-dynamic";
export const metadata = { title: "FAQ | Studio Tugasmu" };
export default async function FaqPage() {
  const [settings, content] = await Promise.all([
    getSiteSettings(),
    getPublicContent(),
  ]);
  return (
    <PublicShell settings={settings}>
      <div className="page-intro">
        <h1>Pertanyaan sebelum memesan</h1>
        <p>
          Informasi tentang simulasi, pilihan layanan, dan konfirmasi pesanan.
        </p>
      </div>
      {content.dataUnavailable ? (
        <DatabaseUnavailable dataLabel="FAQ" />
      ) : (
        <FaqList items={content.faq} />
      )}
    </PublicShell>
  );
}
