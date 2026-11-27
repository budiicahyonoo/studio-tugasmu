"use server";
import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { checkRateLimit } from "../lib/persistentRateLimit";
import { publicError } from "../lib/validation";
import { removeUpload, uploadFile } from "../lib/uploads";
const codeSchema = z.string().regex(/^TRN-[A-F0-9]{40}$/);
async function allowed(action, limit = 10) {
  const h = await headers();
  return (
    await checkRateLimit(
      `turnitin:${action}:${h.get("x-forwarded-for")?.split(",")[0] || "local"}`,
      { limit, windowMs: 60000 },
    )
  ).allowed;
}
async function expireOrder(payment) {
  if (
    payment.status !== "MENUNGGU_PEMBAYARAN" ||
    !payment.kedaluwarsaPada ||
    payment.kedaluwarsaPada > new Date()
  )
    return false;
  return prisma.$transaction(async (tx) => {
    const changed = await tx.pembayaran.updateMany({
      where: {
        id: payment.id,
        status: "MENUNGGU_PEMBAYARAN",
        kedaluwarsaPada: { lte: new Date() },
      },
      data: { status: "KEDALUWARSA" },
    });
    if (changed.count)
      await tx.pesanan.update({
        where: { id: payment.pesananId },
        data: { status: "KEDALUWARSA" },
      });
    return Boolean(changed.count);
  });
}
export async function createTurnitinOrder(form) {
  if (!(await allowed("create", 5)))
    return {
      ok: false,
      error: "Terlalu banyak permintaan. Tunggu satu menit.",
    };
  const parsed = z
    .object({
      nama: z.string().trim().min(2).max(100),
      nomorWhatsApp: z.string().regex(/^62[0-9]{7,13}$/),
      paketId: z.string().min(1).max(100),
      requestId: z.string().uuid(),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      ok: false,
      error: "Isi nama, WhatsApp (628...), dan paket pengecekan.",
    };
  let upload;
  try {
    const settings = await prisma.pengaturan.findUnique({
      where: { id: "default" },
    });
    if (
      !settings?.turnitinAktif ||
      !settings.qrisImageUrl ||
      !settings.namaRekening
    )
      return { ok: false, error: "Pemesanan Turnitin belum dibuka." };
    const paket = await prisma.paket.findUnique({
      where: { id: parsed.data.paketId },
      include: { layanan: true },
    });
    if (
      !paket ||
      paket.layanan.nama !== "Cek Turnitin" ||
      !paket.layanan.aktif ||
      paket.kelompok !== "SOSHUM"
    )
      return { ok: false, error: "Paket pengecekan tidak tersedia." };
    const existing = await prisma.pesanan.findUnique({
      where: { requestId: parsed.data.requestId },
      include: { pembayaran: true },
    });
    if (existing && !existing.deletedAt && existing.pembayaran)
      return { ok: true, kodePesanan: existing.kodePesanan };
    const faculty = await prisma.fakultas.findFirst({
      where: { aktif: true, kelompok: "SOSHUM" },
      orderBy: { urutan: "asc" },
    });
    if (!faculty)
      return { ok: false, error: "Data layanan belum lengkap. Hubungi admin." };
    const file = form.get("dokumenFile");
    upload = await uploadFile(file, "studio_turnitin_docs", {
      pdf: true,
      private: true,
      maxMb: settings.turnitinMaksMb,
    });
    const kodePesanan = `TRN-${randomBytes(20).toString("hex").toUpperCase()}`;
    await prisma.pesanan.create({
      data: {
        ...parsed.data,
        kodePesanan,
        layananId: paket.layananId,
        fakultasId: faculty.id,
        judul: String(file.name).slice(0, 200),
        deskripsiAsli: "Pengecekan dokumen PDF",
        total: paket.harga,
        ringkasan: {
          paketNama: paket.nama,
          estimasiSelesai: paket.layanan.estimasiSelesai,
          qrisImageUrl: settings.qrisImageUrl,
          namaRekening: settings.namaRekening,
        },
        status: "MENUNGGU_PEMBAYARAN",
        pembayaran: {
          create: {
            nominal: paket.harga,
            dokumenNama: String(file.name).slice(0, 200),
            dokumenPublicId: upload.public_id,
            kedaluwarsaPada: new Date(
              Date.now() + settings.turnitinBatasJam * 3600000,
            ),
          },
        },
      },
    });
    revalidatePath("/admin/dashboard");
    return { ok: true, kodePesanan };
  } catch (error) {
    if (upload)
      await removeUpload(upload.public_id, { pdf: true, private: true }).catch(
        () => {},
      );
    publicError("turnitin.create", error);
    return {
      ok: false,
      error:
        "Pesanan belum dibuat. Pastikan dokumen PDF sesuai batas ukuran dan coba lagi.",
    };
  }
}
export async function submitTurnitinPaymentProof(form) {
  if (!(await allowed("proof", 5)))
    return {
      ok: false,
      error: "Tunggu satu menit sebelum mengirim bukti lagi.",
    };
  const parsed = codeSchema.safeParse(
    String(form.get("kodePesanan") || "")
      .trim()
      .toUpperCase(),
  );
  if (!parsed.success) return { ok: false, error: "Kode pesanan tidak valid." };
  let upload;
  try {
    const order = await prisma.pesanan.findUnique({
      where: { kodePesanan: parsed.data },
      include: { pembayaran: true },
    });
    if (!order?.pembayaran || order.deletedAt || order.pembayaran.deletedAt)
      return { ok: false, error: "Pesanan tidak ditemukan." };
    if (await expireOrder(order.pembayaran))
      return { ok: false, error: "Batas pembayaran sudah habis." };
    if (order.pembayaran.status !== "MENUNGGU_PEMBAYARAN")
      return { ok: false, error: "Bukti tidak dapat diubah pada status ini." };
    upload = await uploadFile(form.get("buktiFile"), "studio_turnitin_proofs", {
      private: true,
    });
    await prisma.$transaction(async (tx) => {
      const changed = await tx.pembayaran.updateMany({
        where: {
          id: order.pembayaran.id,
          deletedAt: null,
          status: "MENUNGGU_PEMBAYARAN",
          kedaluwarsaPada: { gt: new Date() },
        },
        data: {
          status: "MENUNGGU_VERIFIKASI",
          buktiPublicId: upload.public_id,
        },
      });
      if (!changed.count) throw new Error("Status sudah berubah.");
      await tx.pesanan.update({
        where: { id: order.id },
        data: { status: "MENUNGGU_VERIFIKASI" },
      });
    });
    const settings = await prisma.pengaturan.findUnique({
      where: { id: "default" },
    });
    revalidatePath("/admin/dashboard");
    return {
      ok: true,
      nomorWhatsApp: settings?.nomorWhatsApp,
      kodePesanan: order.kodePesanan,
    };
  } catch (error) {
    if (upload)
      await removeUpload(upload.public_id, { private: true }).catch(() => {});
    publicError("turnitin.proof", error);
    return {
      ok: false,
      error:
        "Bukti belum tersimpan. Gunakan JPG, PNG, atau WebP maksimal 4 MB, lalu periksa status pesanan.",
    };
  }
}
export async function checkTurnitinOrderStatus(code) {
  if (!(await allowed("track", 20)))
    return { ok: false, error: "Terlalu banyak pencarian. Tunggu satu menit." };
  const parsed = codeSchema.safeParse(
    String(code || "")
      .trim()
      .toUpperCase(),
  );
  if (!parsed.success)
    return { ok: false, error: "Masukkan kode pesanan Turnitin yang lengkap." };
  try {
    const order = await prisma.pesanan.findUnique({
      where: { kodePesanan: parsed.data },
      include: { pembayaran: true },
    });
    if (!order?.pembayaran || order.deletedAt || order.pembayaran.deletedAt)
      return { ok: false, error: "Pesanan tidak ditemukan." };
    const expired = await expireOrder(order.pembayaran);
    const payment = order.pembayaran;
    return {
      ok: true,
      order: {
        kodePesanan: order.kodePesanan,
        status: expired ? "KEDALUWARSA" : order.status,
        nominal: payment.nominal,
        paketNama: order.ringkasan?.paketNama || "",
        qrisImageUrl: order.ringkasan?.qrisImageUrl || null,
        namaRekening: order.ringkasan?.namaRekening || "",
        kedaluwarsaPada: payment.kedaluwarsaPada?.toISOString(),
        hasilPdfUrl:
          payment.hasilPublicId && order.status === "SELESAI"
            ? `/api/files?code=${order.kodePesanan}&kind=hasil`
            : null,
      },
    };
  } catch (error) {
    publicError("turnitin.track", error);
    return { ok: false, error: "Status belum dapat dimuat. Coba lagi." };
  }
}
