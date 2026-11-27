"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../lib/prisma";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const TURNITIN_DEFAULT_FEE = 15000;
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

async function uploadBufferToCloudinary(file, folder) {
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Konfigurasi Cloudinary belum lengkap di environment.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

function generateTurnitinCode() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randPart = randomBytes(2).toString("hex").toUpperCase();
  return `TRN-${datePart}-${randPart}`;
}

export async function createTurnitinOrder(formData) {
  const nama = String(formData.get("nama") || "").trim();
  const fakultasId = String(formData.get("fakultasId") || "").trim();
  const judul = String(formData.get("judul") || "").trim();
  const file = formData.get("dokumenFile");

  if (nama.length < 2 || !fakultasId || judul.length < 3) {
    return { ok: false, error: "Lengkapi nama, fakultas, dan judul dokumen." };
  }

  if (!file || typeof file === "string" || file.size === 0) {
    return { ok: false, error: "Pilih file dokumen (PDF atau DOCX) terlebih dahulu." };
  }

  if (file.size > 4 * 1024 * 1024) {
    return { ok: false, error: "Ukuran dokumen maksimal 4 MB." };
  }

  if (file.type && !ALLOWED_DOC_TYPES.includes(file.type)) {
    return { ok: false, error: "Format dokumen harus PDF, DOC, atau DOCX." };
  }

  try {
    let layanan = await prisma.layanan.findUnique({ where: { nama: "Cek Turnitin" } });
    if (!layanan) {
      layanan = await prisma.layanan.create({
        data: {
          nama: "Cek Turnitin",
          kategori: "UMUM",
          tipeHitung: "PER_PAKET",
          estimasiSelesai: "1x24 jam",
          deskripsi: "Pengecekan kemiripan dokumen Turnitin dan laporan PDF.",
          aktif: true,
        },
      });
    }

    const upload = await uploadBufferToCloudinary(file, "turnitin_docs");
    const kodePesanan = generateTurnitinCode();
    const kedaluwarsaPada = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const pesanan = await prisma.pesanan.create({
      data: {
        kodePesanan,
        nama,
        fakultasId,
        layananId: layanan.id,
        judul,
        deskripsiAsli: `Cek Turnitin untuk dokumen: ${file.name}`,
        total: TURNITIN_DEFAULT_FEE,
        status: "MENUNGGU_PEMBAYARAN",
        pembayaran: {
          create: {
            nominal: TURNITIN_DEFAULT_FEE,
            dokumenUrl: upload.secure_url,
            dokumenNama: file.name,
            status: "MENUNGGU_PEMBAYARAN",
            kedaluwarsaPada,
          },
        },
      },
      include: { pembayaran: true },
    });

    revalidatePath("/admin/dashboard");

    return {
      ok: true,
      kodePesanan: pesanan.kodePesanan,
      nominal: TURNITIN_DEFAULT_FEE,
      kedaluwarsaPada: kedaluwarsaPada.toISOString(),
    };
  } catch (error) {
    console.error("Gagal membuat pesanan Turnitin:", error);
    return { ok: false, error: error.message || "Gagal mengunggah dokumen Turnitin." };
  }
}

export async function submitTurnitinPaymentProof(formData) {
  const kodePesanan = String(formData.get("kodePesanan") || "").trim().toUpperCase();
  const file = formData.get("buktiFile");

  if (!kodePesanan) {
    return { ok: false, error: "Kode pesanan wajib diisi." };
  }
  if (!file || typeof file === "string" || file.size === 0) {
    return { ok: false, error: "Unggah bukti pembayaran QRIS terlebih dahulu." };
  }
  if (file.size > 4 * 1024 * 1024) {
    return { ok: false, error: "Ukuran bukti pembayaran maksimal 4 MB." };
  }
  if (file.type && !ALLOWED_PROOF_TYPES.includes(file.type)) {
    return { ok: false, error: "Bukti pembayaran harus berupa gambar (JPG/PNG/WEBP) atau PDF." };
  }

  try {
    const pesanan = await prisma.pesanan.findUnique({
      where: { kodePesanan },
      include: { pembayaran: true },
    });

    if (!pesanan || !pesanan.pembayaran) {
      return { ok: false, error: "Kode pesanan Turnitin tidak ditemukan." };
    }

    if (
      pesanan.pembayaran.kedaluwarsaPada &&
      pesanan.pembayaran.kedaluwarsaPada < new Date() &&
      pesanan.pembayaran.status === "MENUNGGU_PEMBAYARAN"
    ) {
      await prisma.$transaction([
        prisma.pembayaran.update({
          where: { id: pesanan.pembayaran.id },
          data: { status: "KEDALUWARSA" },
        }),
        prisma.pesanan.update({
          where: { id: pesanan.id },
          data: { status: "KEDALUWARSA" },
        }),
      ]);
      return { ok: false, error: "Batas waktu pembayaran telah habis (KEDALUWARSA)." };
    }

    const upload = await uploadBufferToCloudinary(file, "turnitin_proofs");
    await prisma.$transaction([
      prisma.pembayaran.update({
        where: { id: pesanan.pembayaran.id },
        data: {
          buktiPembayaranUrl: upload.secure_url,
          status: "MENUNGGU_VERIFIKASI",
        },
      }),
      prisma.pesanan.update({
        where: { id: pesanan.id },
        data: { status: "MENUNGGU_VERIFIKASI" },
      }),
    ]);

    const pengaturan = await prisma.pengaturan.findUnique({ where: { id: "default" } });
    revalidatePath("/admin/dashboard");

    return {
      ok: true,
      kodePesanan,
      nomorWhatsApp:
        pengaturan?.nomorWhatsApp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6283151195556",
    };
  } catch (error) {
    console.error("Gagal mengunggah bukti bayar:", error);
    return { ok: false, error: error.message || "Gagal mengunggah bukti pembayaran." };
  }
}

export async function checkTurnitinOrderStatus(kodePesanan) {
  const code = String(kodePesanan || "").trim().toUpperCase();
  if (!code) {
    return { ok: false, error: "Masukkan kode pesanan." };
  }

  try {
    const pesanan = await prisma.pesanan.findUnique({
      where: { kodePesanan: code },
      include: { pembayaran: true },
    });

    if (!pesanan || !pesanan.pembayaran) {
      return { ok: false, error: "Pesanan Turnitin tidak ditemukan." };
    }

    if (
      pesanan.pembayaran.status === "MENUNGGU_PEMBAYARAN" &&
      pesanan.pembayaran.kedaluwarsaPada &&
      pesanan.pembayaran.kedaluwarsaPada < new Date()
    ) {
      await prisma.$transaction([
        prisma.pembayaran.update({
          where: { id: pesanan.pembayaran.id },
          data: { status: "KEDALUWARSA" },
        }),
        prisma.pesanan.update({
          where: { id: pesanan.id },
          data: { status: "KEDALUWARSA" },
        }),
      ]);
      pesanan.status = "KEDALUWARSA";
      pesanan.pembayaran.status = "KEDALUWARSA";
    }

    return {
      ok: true,
      order: {
        kodePesanan: pesanan.kodePesanan,
        nama: pesanan.nama,
        judul: pesanan.judul,
        status: pesanan.status,
        nominal: pesanan.pembayaran.nominal,
        dokumenNama: pesanan.pembayaran.dokumenNama,
        buktiPembayaranUrl: pesanan.pembayaran.buktiPembayaranUrl,
        hasilPdfUrl: pesanan.pembayaran.hasilPdfUrl,
        kedaluwarsaPada: pesanan.pembayaran.kedaluwarsaPada?.toISOString() || null,
      },
    };
  } catch (error) {
    console.error("Gagal memeriksa status Turnitin:", error);
    return { ok: false, error: "Tidak dapat memeriksa status pesanan saat ini." };
  }
}
