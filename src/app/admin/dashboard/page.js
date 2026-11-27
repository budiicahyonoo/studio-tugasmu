import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { getAdminSession } from "../../../lib/auth";
import { publicError } from "../../../lib/validation";
import DatabaseUnavailable from "../../../components/shared/DatabaseUnavailable";
import AdminDashboardClient from "../../../components/admin/AdminDashboardClient";
export const dynamic = "force-dynamic";
const statuses = [
  "BARU",
  "DIPROSES",
  "SELESAI",
  "DIBATALKAN",
  "MENUNGGU_PEMBAYARAN",
  "MENUNGGU_VERIFIKASI",
  "DIBAYAR",
  "KEDALUWARSA",
];
export default async function AdminDashboardPage({ searchParams }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const params = await searchParams;
  const page = Math.max(
    1,
    Math.min(100000, Number.parseInt(params?.page, 10) || 1),
  );
  const q = typeof params?.q === "string" ? params.q.slice(0, 100) : "";
  const status = statuses.includes(params?.status) ? params.status : "";
  const tab = typeof params?.tab === "string" ? params.tab : "ringkasan";
  const orderWhere = {
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: ["nama", "judul", "kodePesanan"].map((key) => ({
            [key]: { contains: q, mode: "insensitive" },
          })),
        }
      : {}),
  };
  let data;
  try {
    const [
      fakultas,
      layanan,
      kategori,
      riwayatHarga,
      orderCount,
      paymentCount,
      faq,
      galeri,
      pengaturan,
      baru,
      verifikasi,
      galleryCount,
      recent,
    ] = await Promise.all([
      prisma.fakultas.findMany({
        orderBy: [{ urutan: "asc" }, { nama: "asc" }],
      }),
      prisma.layanan.findMany({
        orderBy: [{ urutan: "asc" }, { nama: "asc" }],
        include: {
          tarif: true,
          paket: {
            orderBy: { urutan: "asc" },
            include: {
              benefit: { orderBy: [{ urutan: "asc" }, { id: "asc" }] },
            },
          },
          benefit: { orderBy: [{ urutan: "asc" }, { id: "asc" }] },
        },
      }),
      prisma.kategori.findMany({ orderBy: { urutan: "asc" } }),
      prisma.riwayatHarga.findMany({ orderBy: { waktu: "desc" }, take: 100 }),
      prisma.pesanan.count({ where: orderWhere }),
      prisma.pembayaran.count({
        where: { deletedAt: null, pesanan: { deletedAt: null } },
      }),
      prisma.faq.findMany({ orderBy: [{ urutan: "asc" }, { id: "asc" }] }),
      prisma.galeriUlasan.findMany({
        orderBy: [{ urutan: "asc" }, { id: "asc" }],
      }),
      prisma.pengaturan.findUnique({ where: { id: "default" } }),
      prisma.pesanan.count({ where: { deletedAt: null, status: "BARU" } }),
      prisma.pembayaran.count({
        where: {
          deletedAt: null,
          status: "MENUNGGU_VERIFIKASI",
          pesanan: { deletedAt: null },
        },
      }),
      prisma.galeriUlasan.count({ where: { tampil: true } }),
      prisma.pesanan.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { layanan: true },
      }),
    ]);
    const total = tab === "pembayaran" ? paymentCount : orderCount;
    const pages = Math.max(1, Math.ceil(total / 20));
    const current = Math.min(page, pages);
    const [pesanan, pembayaran] = await Promise.all([
      prisma.pesanan.findMany({
        where: orderWhere,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (current - 1) * 20,
        take: 20,
        include: { fakultas: true, layanan: true, paket: true },
      }),
      prisma.pembayaran.findMany({
        where: { deletedAt: null, pesanan: { deletedAt: null } },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (current - 1) * 20,
        take: 20,
        include: { pesanan: true },
      }),
    ]);
    data = {
      fakultas,
      layanan,
      kategori,
      riwayatHarga,
      pesanan,
      pembayaran,
      faq,
      galeri,
      pengaturan,
      recent,
      stats: { baru, verifikasi, galeri: galleryCount },
      paging: { page: current, pages, total, q, status },
    };
  } catch (error) {
    publicError("dashboard.load", error);
  }
  if (!data)
    return (
      <main className="mx-auto min-h-screen max-w-3xl p-6">
        <h1 className="mb-5 text-2xl font-bold">Dashboard admin</h1>
        <DatabaseUnavailable dataLabel="Dashboard admin" />
      </main>
    );
  return (
    <AdminDashboardClient adminUser={session} initialTab={tab} data={data} />
  );
}
