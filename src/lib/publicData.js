import { prisma } from "./prisma";

export const DEFAULT_PENGATURAN = {
  nomorWhatsApp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6283151195556",
  qrisImageUrl: null,
  namaRekening: null,
  syaratKetentuan: "",
  kebijakanPrivasi: "",
  instagramUrl: "https://www.instagram.com/studiotugasmu19/",
  emailKontak: "halo@studiotugasmu.com",
  calendlyUrl: "https://calendly.com/budicahyono-dev/new-meeting",
};

export async function getPublicCatalogData() {
  try {
    const [fakultas, layanan, pengaturan] = await Promise.all([
      prisma.fakultas.findMany({
        where: { aktif: true },
        orderBy: [{ urutan: "asc" }, { nama: "asc" }],
      }),
      prisma.layanan.findMany({
        where: { aktif: true },
        orderBy: [{ urutan: "asc" }, { nama: "asc" }],
        include: {
          tarif: true,
          paket: {
            orderBy: { urutan: "asc" },
            include: {
              benefit: { orderBy: { urutan: "asc" } },
            },
          },
          benefit: { orderBy: { urutan: "asc" } },
        },
      }),
      prisma.pengaturan.findUnique({ where: { id: "default" } }),
    ]);

    return {
      fakultas,
      layanan,
      pengaturan: pengaturan || DEFAULT_PENGATURAN,
      dataUnavailable: false,
    };
  } catch (error) {
    console.error("Gagal memuat katalog publik:", error);
    return {
      fakultas: [],
      layanan: [],
      pengaturan: DEFAULT_PENGATURAN,
      dataUnavailable: true,
    };
  }
}

export async function getSiteSettings() {
  try {
    const pengaturan = await prisma.pengaturan.findUnique({ where: { id: "default" } });
    return pengaturan || DEFAULT_PENGATURAN;
  } catch {
    return DEFAULT_PENGATURAN;
  }
}
