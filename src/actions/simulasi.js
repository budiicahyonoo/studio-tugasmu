"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { calculateEstimate } from "../lib/calculateEstimate";

const simulasiOrderSchema = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 karakter.").max(100),
  fakultasId: z.string().min(1, "Pilih fakultas terlebih dahulu."),
  layananId: z.string().min(1, "Pilih layanan terlebih dahulu."),
  paketId: z.string().optional().nullable(),
  judul: z.string().trim().min(3, "Judul tugas minimal 3 karakter.").max(200),
  deskripsiAsli: z.string().trim().min(5, "Deskripsi tugas minimal 5 karakter.").max(4000),
  deskripsiAI: z.string().trim().max(4000).optional().nullable(),
  jumlah: z.coerce.number().int().min(1).max(1000).optional().nullable(),
  fallbackTotal: z.coerce.number().int().min(0).optional(),
  fallbackEstimasi: z.string().optional(),
});

function generateOrderCode() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randPart = randomBytes(2).toString("hex").toUpperCase();
  return `TM19-${datePart}-${randPart}`;
}

export async function submitSimulasiOrder(input) {
  const parsed = simulasiOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Data simulasi tidak valid.",
    };
  }

  const data = parsed.data;
  const kodePesanan = generateOrderCode();
  const defaultWa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6283151195556";

  try {
    const [fakultas, layanan, pengaturan] = await Promise.all([
      prisma.fakultas.findUnique({ where: { id: data.fakultasId } }),
      prisma.layanan.findUnique({
        where: { id: data.layananId },
        include: { tarif: true, paket: true },
      }),
      prisma.pengaturan.findUnique({ where: { id: "default" } }),
    ]);

    if (!fakultas || !layanan) {
      return { ok: false, error: "Fakultas atau layanan tidak ditemukan." };
    }

    let total = 0;
    let paketNama = null;
    let jumlahFinal = null;

    if (layanan.tipeHitung === "PER_PAKET") {
      const paket = layanan.paket.find(
        (p) => p.id === data.paketId && p.kelompok === fakultas.kelompok
      );
      if (!paket) {
        return { ok: false, error: "Paket yang dipilih tidak sesuai dengan kelompok fakultas." };
      }
      total = calculateEstimate({
        tipeHitung: "PER_PAKET",
        paketHarga: paket.harga,
      });
      paketNama = paket.nama;
    } else {
      const tarif = layanan.tarif.find((t) => t.kelompok === fakultas.kelompok);
      if (!tarif) {
        return { ok: false, error: "Tarif untuk kelompok fakultas ini belum tersedia." };
      }
      jumlahFinal = data.jumlah || 1;
      total = calculateEstimate({
        tipeHitung: layanan.tipeHitung,
        hargaPerUnit: tarif.hargaPerUnit,
        jumlah: jumlahFinal,
      });
    }

    await prisma.pesanan.create({
      data: {
        kodePesanan,
        nama: data.nama,
        fakultasId: fakultas.id,
        layananId: layanan.id,
        paketId: data.paketId || null,
        judul: data.judul,
        deskripsiAsli: data.deskripsiAsli,
        deskripsiAI: data.deskripsiAI || null,
        jumlah: jumlahFinal,
        total,
        status: "BARU",
      },
    });

    revalidatePath("/admin/dashboard");

    return {
      ok: true,
      dbSaved: true,
      kodePesanan,
      total,
      estimasiSelesai: layanan.estimasiSelesai,
      paketNama,
      fakultasNama: fakultas.nama,
      kelompok: fakultas.kelompok,
      layananNama: layanan.nama,
      tipeHitung: layanan.tipeHitung,
      jumlah: jumlahFinal,
      nomorWhatsApp: pengaturan?.nomorWhatsApp || defaultWa,
    };
  } catch (error) {
    console.error("Gagal menyimpan pesanan simulasi ke database:", error);
    // Reliability NFR: WhatsApp tetap dapat dibuka meski database gagal menyimpan
    return {
      ok: true,
      dbSaved: false,
      kodePesanan,
      total: data.fallbackTotal || 0,
      estimasiSelesai: data.fallbackEstimasi || "1x24 jam",
      nomorWhatsApp: defaultWa,
    };
  }
}
