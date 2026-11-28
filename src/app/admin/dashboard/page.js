import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { getAdminSession } from "../../../lib/auth";
import { publicError } from "../../../lib/validation";
import DatabaseUnavailable from "../../../components/shared/DatabaseUnavailable";
import AdminDashboardClient from "../../../components/admin/AdminDashboardClient";
import { expireExpiredTurnitinPayments } from "../../../lib/turnitinExpiry";
export const dynamic = "force-dynamic";
const pageSize = 20;
const tabs = new Set([
  "ringkasan",
  "pesanan",
  "pembayaran",
  "layanan",
  "kategori",
  "tarif",
  "paket",
  "fakultas",
  "ulasan",
  "faq",
  "pengaturan",
]);
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
  const requestedPage = Math.max(
    1,
    Math.min(100000, Number.parseInt(params?.page, 10) || 1),
  );
  const requestedHistoryPage = Math.max(
    1,
    Math.min(100000, Number.parseInt(params?.historyPage, 10) || 1),
  );
  const q = typeof params?.q === "string" ? params.q.slice(0, 100) : "";
  const status = statuses.includes(params?.status) ? params.status : "";
  const tab = tabs.has(params?.tab) ? params.tab : "ringkasan";
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
    await expireExpiredTurnitinPayments({ limit: 100 });
    const [pengaturan, baru, verifikasi, galleryCount] = await Promise.all([
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
    ]);
    let paging = { page: 1, pages: 1, total: 0, q: "", status: "" };
    let historyPaging = { page: 1, pages: 1, total: 0 };
    let collection = {};
    const setPaging = (total, page = requestedPage) => {
      const pages = Math.max(1, Math.ceil(total / pageSize));
      paging = {
        page: Math.min(page, pages),
        pages,
        total,
        q: tab === "pesanan" ? q : "",
        status: tab === "pesanan" ? status : "",
      };
    };
    const pageQuery = (model, args) =>
      model.findMany({
        ...args,
        skip: (paging.page - 1) * pageSize,
        take: pageSize,
      });

    if (tab === "ringkasan") {
      collection.recent = await prisma.pesanan.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { layanan: true },
      });
    } else if (tab === "pesanan") {
      const total = await prisma.pesanan.count({ where: orderWhere });
      setPaging(total);
      collection.pesanan = await pageQuery(prisma.pesanan, {
        where: orderWhere,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: { fakultas: true, layanan: true, paket: true },
      });
    } else if (tab === "pembayaran") {
      const where = { deletedAt: null, pesanan: { deletedAt: null } };
      const total = await prisma.pembayaran.count({ where });
      setPaging(total);
      collection.pembayaran = await pageQuery(prisma.pembayaran, {
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: { pesanan: true },
      });
    } else if (tab === "layanan") {
      const total = await prisma.layanan.count();
      setPaging(total);
      const [layanan, kategori] = await Promise.all([
        pageQuery(prisma.layanan, {
          orderBy: [{ urutan: "asc" }, { nama: "asc" }],
          include: {
            benefit: {
              orderBy: [{ urutan: "asc" }, { id: "asc" }],
              take: 100,
            },
          },
        }),
        prisma.kategori.findMany({
          orderBy: [{ urutan: "asc" }, { nama: "asc" }],
          take: 200,
        }),
      ]);
      collection.layanan = layanan;
      collection.kategori = kategori;
    } else if (tab === "kategori") {
      const total = await prisma.kategori.count();
      setPaging(total);
      collection.kategori = await pageQuery(prisma.kategori, {
        orderBy: [{ urutan: "asc" }, { nama: "asc" }],
      });
    } else if (tab === "tarif") {
      const where = { tipeHitung: { not: "PER_PAKET" } };
      const total = await prisma.layanan.count({ where });
      setPaging(total);
      const historyTotal = await prisma.riwayatHarga.count();
      historyPaging = {
        page: Math.min(
          requestedHistoryPage,
          Math.max(1, Math.ceil(historyTotal / pageSize)),
        ),
        pages: Math.max(1, Math.ceil(historyTotal / pageSize)),
        total: historyTotal,
      };
      const [layanan, riwayatHarga] = await Promise.all([
        pageQuery(prisma.layanan, {
          where,
          orderBy: [{ urutan: "asc" }, { nama: "asc" }],
          include: { tarif: true },
        }),
        prisma.riwayatHarga.findMany({
          orderBy: [{ waktu: "desc" }, { id: "desc" }],
          skip: (historyPaging.page - 1) * pageSize,
          take: pageSize,
        }),
      ]);
      collection.layanan = layanan;
      collection.riwayatHarga = riwayatHarga;
    } else if (tab === "paket") {
      const where = { layanan: { is: { tipeHitung: "PER_PAKET" } } };
      const total = await prisma.paket.count({ where });
      setPaging(total);
      const [paket, layananOptions] = await Promise.all([
        pageQuery(prisma.paket, {
          where,
          orderBy: [{ urutan: "asc" }, { nama: "asc" }, { id: "asc" }],
          include: {
            layanan: { select: { id: true, nama: true } },
            benefit: {
              orderBy: [{ urutan: "asc" }, { id: "asc" }],
              take: 100,
            },
          },
        }),
        prisma.layanan.findMany({
          where: { tipeHitung: "PER_PAKET" },
          orderBy: [{ urutan: "asc" }, { nama: "asc" }],
          take: 500,
          select: { id: true, nama: true },
        }),
      ]);
      collection.paket = paket;
      collection.layananOptions = layananOptions;
    } else if (tab === "fakultas") {
      const total = await prisma.fakultas.count();
      setPaging(total);
      collection.fakultas = await pageQuery(prisma.fakultas, {
        orderBy: [{ urutan: "asc" }, { nama: "asc" }],
      });
    } else if (tab === "ulasan") {
      const total = await prisma.galeriUlasan.count();
      setPaging(total);
      collection.galeri = await pageQuery(prisma.galeriUlasan, {
        orderBy: [{ urutan: "asc" }, { id: "asc" }],
      });
    } else if (tab === "faq") {
      const total = await prisma.faq.count();
      setPaging(total);
      collection.faq = await pageQuery(prisma.faq, {
        orderBy: [{ urutan: "asc" }, { id: "asc" }],
      });
    }
    data = {
      ...collection,
      pengaturan,
      stats: { baru, verifikasi, galeri: galleryCount },
      paging,
      historyPaging,
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
