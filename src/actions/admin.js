"use server";

import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAdminSession } from "../lib/auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function revalidateAllPublicAndAdmin() {
  revalidatePath("/");
  revalidatePath("/simulasi");
  revalidatePath("/layanan");
  revalidatePath("/portofolio");
  revalidatePath("/turnitin");
  revalidatePath("/privacy");
  revalidatePath("/terms");
  revalidatePath("/admin/dashboard");
}

// --- FAKULTAS ---
export async function saveFakultas(formData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "").trim();
  const nama = String(formData.get("nama") || "").trim();
  const kelompok = String(formData.get("kelompok") || "SOSHUM");
  const urutan = Number(formData.get("urutan") || 0);
  const aktif = formData.get("aktif") !== "false";

  const parsed = z
    .object({
      nama: z.string().min(2).max(120),
      kelompok: z.enum(["SAINTEK", "SOSHUM"]),
      urutan: z.number().int().min(0),
    })
    .safeParse({ nama, kelompok, urutan });

  if (!parsed.success) {
    return { ok: false, error: "Data fakultas tidak valid." };
  }

  try {
    if (id) {
      await prisma.fakultas.update({
        where: { id },
        data: { ...parsed.data, aktif },
      });
    } else {
      await prisma.fakultas.create({
        data: { ...parsed.data, aktif },
      });
    }
    revalidateAllPublicAndAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Gagal menyimpan fakultas." };
  }
}

export async function deleteFakultas(formData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  try {
    const orderCount = await prisma.pesanan.count({ where: { fakultasId: id } });
    if (orderCount > 0) {
      await prisma.fakultas.update({ where: { id }, data: { aktif: false } });
    } else {
      await prisma.fakultas.delete({ where: { id } });
    }
    revalidateAllPublicAndAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Gagal menghapus fakultas." };
  }
}

// --- LAYANAN ---
export async function saveLayanan(formData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "").trim();
  const nama = String(formData.get("nama") || "").trim();
  const kategori = String(formData.get("kategori") || "UMUM");
  const tipeHitung = String(formData.get("tipeHitung") || "PER_LEMBAR");
  const estimasiSelesai = String(formData.get("estimasiSelesai") || "1x24 jam").trim();
  const deskripsi = String(formData.get("deskripsi") || "").trim() || null;
  const urutan = Number(formData.get("urutan") || 0);
  const aktif = formData.get("aktif") !== "false";

  const parsed = z
    .object({
      nama: z.string().min(2).max(100),
      kategori: z.enum(["UMUM", "KHUSUS", "PKL"]),
      tipeHitung: z.enum(["PER_LEMBAR", "PER_SLIDE", "PER_PAKET"]),
      estimasiSelesai: z.string().min(2).max(60),
      urutan: z.number().int().min(0),
    })
    .safeParse({ nama, kategori, tipeHitung, estimasiSelesai, urutan });

  if (!parsed.success) {
    return { ok: false, error: "Data layanan tidak valid." };
  }

  try {
    if (id) {
      await prisma.layanan.update({
        where: { id },
        data: { ...parsed.data, deskripsi, aktif },
      });
    } else {
      await prisma.layanan.create({
        data: { ...parsed.data, deskripsi, aktif },
      });
    }
    revalidateAllPublicAndAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Gagal menyimpan layanan." };
  }
}

export async function deleteLayanan(formData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  try {
    const orderCount = await prisma.pesanan.count({ where: { layananId: id } });
    if (orderCount > 0) {
      await prisma.layanan.update({ where: { id }, data: { aktif: false } });
    } else {
      await prisma.layanan.delete({ where: { id } });
    }
    revalidateAllPublicAndAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Gagal menghapus layanan." };
  }
}

// --- TARIF ---
export async function saveTarif(formData) {
  const admin = await requireAdminSession();
  const layananId = String(formData.get("layananId") || "");
  const kelompok = String(formData.get("kelompok") || "SOSHUM");
  const hargaPerUnit = Number(formData.get("hargaPerUnit"));

  const parsed = z
    .object({
      layananId: z.string().min(1),
      kelompok: z.enum(["SAINTEK", "SOSHUM"]),
      hargaPerUnit: z.number().int().min(0),
    })
    .safeParse({ layananId, kelompok, hargaPerUnit });

  if (!parsed.success) {
    return { ok: false, error: "Tarif harus berupa angka Rupiah bulat." };
  }

  try {
    const layanan = await prisma.layanan.findUnique({ where: { id: layananId } });
    const existing = await prisma.tarif.findUnique({
      where: { layananId_kelompok: { layananId, kelompok } },
    });

    const saved = await prisma.tarif.upsert({
      where: { layananId_kelompok: { layananId, kelompok } },
      update: { hargaPerUnit },
      create: { layananId, kelompok, hargaPerUnit },
    });

    if (!existing || existing.hargaPerUnit !== hargaPerUnit) {
      await prisma.riwayatHarga.create({
        data: {
          entitas: "TARIF",
          referensiId: saved.id,
          keterangan: `${layanan?.nama || "Layanan"} (${kelompok})`,
          nilaiLama: existing?.hargaPerUnit ?? 0,
          nilaiBaru: hargaPerUnit,
          diubahOleh: admin.username,
        },
      });
    }

    revalidateAllPublicAndAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Gagal menyimpan tarif." };
  }
}

// --- PAKET & BENEFIT ---
export async function savePaket(formData) {
  const admin = await requireAdminSession();
  const id = String(formData.get("id") || "").trim();
  const layananId = String(formData.get("layananId") || "");
  const kelompok = String(formData.get("kelompok") || "SOSHUM");
  const nama = String(formData.get("nama") || "").trim();
  const deskripsi = String(formData.get("deskripsi") || "").trim() || null;
  const harga = Number(formData.get("harga"));
  const urutan = Number(formData.get("urutan") || 0);

  const parsed = z
    .object({
      layananId: z.string().min(1),
      kelompok: z.enum(["SAINTEK", "SOSHUM"]),
      nama: z.string().min(2).max(100),
      harga: z.number().int().min(0),
      urutan: z.number().int().min(0),
    })
    .safeParse({ layananId, kelompok, nama, harga, urutan });

  if (!parsed.success) {
    return { ok: false, error: "Data paket tidak valid." };
  }

  try {
    const layanan = await prisma.layanan.findUnique({ where: { id: layananId } });
    if (id) {
      const existing = await prisma.paket.findUnique({ where: { id } });
      await prisma.paket.update({
        where: { id },
        data: { ...parsed.data, deskripsi },
      });
      if (existing && existing.harga !== harga) {
        await prisma.riwayatHarga.create({
          data: {
            entitas: "PAKET",
            referensiId: id,
            keterangan: `${layanan?.nama || "Layanan"} - ${nama} (${kelompok})`,
            nilaiLama: existing.harga,
            nilaiBaru: harga,
            diubahOleh: admin.username,
          },
        });
      }
    } else {
      const created = await prisma.paket.create({
        data: { ...parsed.data, deskripsi },
      });
      await prisma.riwayatHarga.create({
        data: {
          entitas: "PAKET",
          referensiId: created.id,
          keterangan: `${layanan?.nama || "Layanan"} - ${nama} (${kelompok})`,
          nilaiLama: 0,
          nilaiBaru: harga,
          diubahOleh: admin.username,
        },
      });
    }
    revalidateAllPublicAndAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Gagal menyimpan paket." };
  }
}

export async function deletePaket(formData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  try {
    await prisma.paket.delete({ where: { id } });
    revalidateAllPublicAndAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Gagal menghapus paket." };
  }
}

export async function saveBenefit(formData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "").trim();
  const layananId = String(formData.get("layananId") || "").trim() || null;
  const paketId = String(formData.get("paketId") || "").trim() || null;
  const teks = String(formData.get("teks") || "").trim();

  if (!teks || (!layananId && !paketId)) {
    return { ok: false, error: "Teks benefit dan target layanan/paket wajib diisi." };
  }

  try {
    if (id) {
      await prisma.benefit.update({ where: { id }, data: { teks } });
    } else {
      const count = await prisma.benefit.count({
        where: layananId ? { layananId } : { paketId },
      });
      await prisma.benefit.create({
        data: { layananId, paketId, teks, urutan: count + 1 },
      });
    }
    revalidateAllPublicAndAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Gagal menyimpan benefit." };
  }
}

export async function moveBenefit(formData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  const direction = String(formData.get("direction") || "up");

  try {
    const current = await prisma.benefit.findUnique({ where: { id } });
    if (!current) return { ok: false, error: "Benefit tidak ditemukan." };

    const siblings = await prisma.benefit.findMany({
      where: current.paketId ? { paketId: current.paketId } : { layananId: current.layananId },
      orderBy: { urutan: "asc" },
    });

    const index = siblings.findIndex((b) => b.id === id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= siblings.length) {
      return { ok: true };
    }

    const other = siblings[swapIndex];
    await prisma.$transaction([
      prisma.benefit.update({ where: { id: current.id }, data: { urutan: other.urutan } }),
      prisma.benefit.update({ where: { id: other.id }, data: { urutan: current.urutan } }),
    ]);

    revalidateAllPublicAndAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Gagal mengurutkan benefit." };
  }
}

export async function deleteBenefit(formData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  try {
    await prisma.benefit.delete({ where: { id } });
    revalidateAllPublicAndAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Gagal menghapus benefit." };
  }
}

// --- PESANAN ---
export async function updatePesananStatus(formData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const catatanAdmin = String(formData.get("catatanAdmin") || "").trim() || null;

  const parsed = z
    .enum([
      "BARU",
      "DIPROSES",
      "SELESAI",
      "DIBATALKAN",
      "MENUNGGU_PEMBAYARAN",
      "MENUNGGU_VERIFIKASI",
      "DIBAYAR",
      "KEDALUWARSA",
    ])
    .safeParse(status);

  if (!parsed.success) {
    return { ok: false, error: "Status pesanan tidak valid." };
  }

  try {
    await prisma.pesanan.update({
      where: { id },
      data: { status: parsed.data, catatanAdmin },
    });
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Gagal memperbarui status pesanan." };
  }
}

export async function softDeletePesanan(formData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  try {
    await prisma.pesanan.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/admin/dashboard");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Gagal menghapus pesanan." };
  }
}

// --- PEMBAYARAN QRIS & TURNITIN ---
export async function verifyTurnitinPayment(formData) {
  const admin = await requireAdminSession();
  const pembayaranId = String(formData.get("pembayaranId") || "");
  try {
    const pembayaran = await prisma.pembayaran.findUnique({ where: { id: pembayaranId } });
    if (!pembayaran) return { ok: false, error: "Data pembayaran tidak ditemukan." };

    await prisma.$transaction([
      prisma.pembayaran.update({
        where: { id: pembayaranId },
        data: {
          status: "DIBAYAR",
          diverifikasiOleh: admin.username,
          dibayarPada: new Date(),
        },
      }),
      prisma.pesanan.update({
        where: { id: pembayaran.pesananId },
        data: { status: "DIBAYAR" },
      }),
    ]);

    revalidateAllPublicAndAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Gagal memverifikasi pembayaran." };
  }
}

export async function rejectTurnitinPayment(formData) {
  const admin = await requireAdminSession();
  const pembayaranId = String(formData.get("pembayaranId") || "");
  try {
    const pembayaran = await prisma.pembayaran.findUnique({ where: { id: pembayaranId } });
    if (!pembayaran) return { ok: false, error: "Data pembayaran tidak ditemukan." };

    await prisma.$transaction([
      prisma.pembayaran.update({
        where: { id: pembayaranId },
        data: { status: "DITOLAK", diverifikasiOleh: admin.username },
      }),
      prisma.pesanan.update({
        where: { id: pembayaran.pesananId },
        data: { status: "DIBATALKAN" },
      }),
    ]);

    revalidateAllPublicAndAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Gagal menolak pembayaran." };
  }
}

export async function uploadTurnitinResultPdf(formData) {
  await requireAdminSession();
  const pembayaranId = String(formData.get("pembayaranId") || "");
  const file = formData.get("hasilPdfFile");

  if (!file || typeof file === "string" || file.size === 0) {
    return { ok: false, error: "Pilih file PDF hasil Turnitin." };
  }
  if (file.size > 4 * 1024 * 1024) {
    return { ok: false, error: "Ukuran file PDF maksimal 4 MB." };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const upload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "turnitin_results", resource_type: "auto" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    const pembayaran = await prisma.pembayaran.update({
      where: { id: pembayaranId },
      data: { hasilPdfUrl: upload.secure_url },
    });

    await prisma.pesanan.update({
      where: { id: pembayaran.pesananId },
      data: { status: "SELESAI" },
    });

    revalidateAllPublicAndAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Gagal mengunggah hasil PDF." };
  }
}

// --- PENGATURAN ---
export async function savePengaturan(formData) {
  await requireAdminSession();
  const nomorWhatsApp = String(formData.get("nomorWhatsApp") || "").replace(/[^0-9]/g, "");
  const namaRekening = String(formData.get("namaRekening") || "").trim() || null;
  const syaratKetentuan = String(formData.get("syaratKetentuan") || "").trim();
  const kebijakanPrivasi = String(formData.get("kebijakanPrivasi") || "").trim();
  const instagramUrl = String(formData.get("instagramUrl") || "").trim();
  const emailKontak = String(formData.get("emailKontak") || "").trim();
  const calendlyUrl = String(formData.get("calendlyUrl") || "").trim();
  const qrisFile = formData.get("qrisFile");

  if (!nomorWhatsApp || nomorWhatsApp.length < 9) {
    return { ok: false, error: "Nomor WhatsApp admin tidak valid." };
  }

  try {
    let qrisImageUrl;
    if (qrisFile && typeof qrisFile !== "string" && qrisFile.size > 0) {
      if (qrisFile.size > 4 * 1024 * 1024) {
        return { ok: false, error: "Ukuran gambar QRIS maksimal 4 MB." };
      }
      const buffer = Buffer.from(await qrisFile.arrayBuffer());
      const upload = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "qris_seabank", resource_type: "image" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(buffer);
      });
      qrisImageUrl = upload.secure_url;
    }

    await prisma.pengaturan.upsert({
      where: { id: "default" },
      update: {
        nomorWhatsApp,
        namaRekening,
        syaratKetentuan,
        kebijakanPrivasi,
        instagramUrl,
        emailKontak,
        calendlyUrl,
        ...(qrisImageUrl ? { qrisImageUrl } : {}),
      },
      create: {
        id: "default",
        nomorWhatsApp,
        namaRekening,
        syaratKetentuan,
        kebijakanPrivasi,
        instagramUrl,
        emailKontak,
        calendlyUrl,
        qrisImageUrl: qrisImageUrl || null,
      },
    });

    revalidateAllPublicAndAdmin();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Gagal menyimpan pengaturan." };
  }
}
