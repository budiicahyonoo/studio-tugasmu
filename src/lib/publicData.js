import { prisma } from "./prisma";
import { publicError } from "./validation";

export const DEFAULT_PENGATURAN = {
  nomorWhatsApp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  qrisImageUrl: null,
  namaRekening: null,
  syaratKetentuan: "",
  kebijakanPrivasi: "",
  instagramUrl: "https://www.instagram.com/studiotugasmu19/",
  emailKontak: "halo@studiotugasmu.com",
  calendlyUrl: "https://calendly.com/budicahyono-dev/new-meeting",
  jumlahKlienDibantu: null,
  turnitinAktif: false,
  turnitinMaksMb: 4,
  turnitinFormat: "application/pdf",
  turnitinBatasJam: 24,
};

export async function getPublicCatalogData() {
  try {
    const [fakultas, layanan, pengaturan, kategori] = await Promise.all([
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
      prisma.kategori.findMany({
        orderBy: [{ urutan: "asc" }, { nama: "asc" }],
      }),
    ]);

    return {
      fakultas,
      layanan,
      kategori,
      pengaturan: pengaturan || DEFAULT_PENGATURAN,
      dataUnavailable: false,
    };
  } catch (error) {
    publicError("catalog.load", error);
    return {
      fakultas: [],
      layanan: [],
      kategori: [],
      pengaturan: DEFAULT_PENGATURAN,
      dataUnavailable: true,
    };
  }
}

export async function getPublicContent() {
  try {
    const [faq, galeri] = await Promise.all([
      prisma.faq.findMany({
        where: { tampil: true },
        orderBy: [{ urutan: "asc" }, { id: "asc" }],
      }),
      prisma.galeriUlasan.findMany({
        where: { tampil: true },
        orderBy: [{ urutan: "asc" }, { createdAt: "desc" }],
      }),
    ]);
    return { faq, galeri, dataUnavailable: false };
  } catch (error) {
    publicError("content.load", error);
    return { faq: [], galeri: [], dataUnavailable: true };
  }
}

export async function getSiteSettings() {
  try {
    const pengaturan = await prisma.pengaturan.findUnique({
      where: { id: "default" },
    });
    return pengaturan || DEFAULT_PENGATURAN;
  } catch {
    return DEFAULT_PENGATURAN;
  }
}
