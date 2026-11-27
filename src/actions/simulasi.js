"use server";
import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { resolveQuote } from "../lib/quote";
import { checkRateLimit } from "../lib/persistentRateLimit";
import { publicError } from "../lib/validation";

const schema = z.object({
  nama: z.string().trim().min(2).max(100),
  fakultasId: z.string().min(1).max(100),
  layananId: z.string().min(1).max(100),
  jenjang: z.enum(["SISWA", "MAHASISWA"]).default("MAHASISWA"),
  paketId: z.string().max(100).nullish(),
  judul: z.string().trim().min(3).max(200),
  deskripsiAsli: z.string().trim().min(5).max(4000),
  deskripsiAI: z.string().trim().max(4000).nullish(),
  jumlah: z.number().int().min(1).max(1000).nullish(),
  requestId: z.string().uuid(),
  quotedTotal: z.number().int().min(0).max(2147483647),
});
export async function submitSimulasiOrder(input) {
  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: "Periksa nama, judul, deskripsi, dan jumlah tugas.",
    };
  const h = await headers();
  if (
    !(
      await checkRateLimit(
        `order:${h.get("x-forwarded-for")?.split(",")[0] || "local"}`,
        { limit: 15, windowMs: 60000 },
      )
    ).allowed
  )
    return {
      ok: false,
      error: "Terlalu banyak permintaan. Tunggu satu menit.",
    };
  const data = parsed.data;
  try {
    const [fakultas, layanan, settings] = await Promise.all([
      prisma.fakultas.findUnique({ where: { id: data.fakultasId } }),
      prisma.layanan.findUnique({
        where: { id: data.layananId },
        include: {
          tarif: true,
          benefit: true,
          paket: { include: { benefit: true } },
        },
      }),
      prisma.pengaturan.findUnique({ where: { id: "default" } }),
    ]);
    let quote;
    try {
      quote = resolveQuote({ ...data, fakultas, layanan });
    } catch (error) {
      return { ok: false, error: error.message };
    }
    if (quote.total !== data.quotedTotal)
      return {
        ok: false,
        priceChanged: true,
        error:
          "Tarif telah berubah. Muat ulang halaman dan tinjau harga baru sebelum menyetujui.",
      };
    const {
      quotedTotal: _quotedTotal,
      paketId: _paketId,
      jumlah: _jumlah,
      ...orderData
    } = data;
    const saved = await prisma.pesanan.upsert({
      where: { requestId: data.requestId },
      update: {},
      create: {
        ...orderData,
        paketId: quote.paketId,
        jumlah: quote.jumlah,
        total: quote.total,
        ringkasan: quote,
        kodePesanan: `ST-${randomBytes(10).toString("hex").toUpperCase()}`,
      },
    });
    if (saved.deletedAt)
      return {
        ok: false,
        error:
          "Permintaan ini sudah ditutup. Muat ulang halaman untuk pesanan baru.",
      };
    revalidatePath("/admin/dashboard");
    return {
      ok: true,
      dbSaved: true,
      ...saved.ringkasan,
      kodePesanan: saved.kodePesanan,
      nomorWhatsApp: settings?.nomorWhatsApp,
    };
  } catch (error) {
    publicError("order.create", error);
    return {
      ok: false,
      canContact: true,
      error:
        "Pesanan belum tersimpan. Kamu tetap bisa mengirim rincian simulasi ke WhatsApp tanpa kode pesanan.",
    };
  }
}
