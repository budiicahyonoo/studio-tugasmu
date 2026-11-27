import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { getAdminSession } from "../../../lib/auth";
import DatabaseUnavailable from "../../../components/shared/DatabaseUnavailable";
import AdminDashboardClient from "../../../components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  let dashboardData = null;

  try {
    const [
      fakultas,
      layanan,
      riwayatHarga,
      pesanan,
      pembayaran,
      ulasan,
      portfolio,
      pengaturan,
    ] = await Promise.all([
      prisma.fakultas.findMany({ orderBy: [{ urutan: "asc" }, { nama: "asc" }] }),
      prisma.layanan.findMany({
        orderBy: [{ urutan: "asc" }, { nama: "asc" }],
        include: {
          tarif: true,
          paket: {
            orderBy: { urutan: "asc" },
            include: { benefit: { orderBy: { urutan: "asc" } } },
          },
          benefit: { orderBy: { urutan: "asc" } },
        },
      }),
      prisma.riwayatHarga.findMany({ orderBy: { waktu: "desc" }, take: 30 }),
      prisma.pesanan.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: { fakultas: true, layanan: true, paket: true },
      }),
      prisma.pembayaran.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: { pesanan: true },
      }),
      prisma.ulasan.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.portfolio.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.pengaturan.findUnique({ where: { id: "default" } }),
    ]);

    dashboardData = {
      fakultas,
      layanan,
      riwayatHarga,
      pesanan,
      pembayaran,
      ulasan,
      portfolio,
      pengaturan,
    };
  } catch (error) {
    console.error("Gagal memuat dashboard admin:", error);
  }

  if (!dashboardData) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] p-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-2xl font-bold text-[#16324F]">Dashboard Admin</h1>
          <DatabaseUnavailable dataLabel="Data dashboard admin" />
        </div>
      </main>
    );
  }

  return <AdminDashboardClient adminUser={session} data={dashboardData} />;
}
