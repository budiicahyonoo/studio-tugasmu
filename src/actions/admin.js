"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAdminSession } from "../lib/auth";
import { orderIndexSchema, publicError, rupiahSchema } from "../lib/validation";
import { removeUpload, uploadFile } from "../lib/uploads";

function refresh() {
  [
    "/",
    "/simulasi",
    "/layanan",
    "/tarif",
    "/ulasan",
    "/faq",
    "/turnitin",
    "/privacy",
    "/terms",
    "/admin/dashboard",
  ].forEach((path) => revalidatePath(path));
}
function failure(event, error) {
  publicError(event, error);
  return {
    ok: false,
    error:
      error?.code === "P2002"
        ? "Nama atau data yang sama sudah digunakan."
        : error?.code === "P2003"
          ? "Data masih digunakan pesanan atau layanan lain."
          : "Perubahan belum tersimpan. Periksa data dan coba lagi.",
  };
}
const facultySchema = z.object({
  nama: z.string().trim().min(2).max(120),
  kelompok: z.enum(["SAINTEK", "SOSHUM"]),
  urutan: orderIndexSchema,
  aktif: z.boolean(),
});
const serviceSchema = z.object({
  nama: z.string().trim().min(2).max(100),
  kategori: z.string().min(1).max(40),
  tipeHitung: z.enum(["PER_LEMBAR", "PER_SLIDE", "PER_PAKET"]),
  estimasiSelesai: z.string().trim().min(2).max(60),
  deskripsi: z.string().trim().max(2000),
  urutan: orderIndexSchema,
  aktif: z.boolean(),
});
function catalogInput(form) {
  return {
    ...Object.fromEntries(form),
    urutan: form.get("urutan") || 0,
    aktif: form.get("aktif") !== "false",
    deskripsi: String(form.get("deskripsi") || ""),
  };
}

export async function saveFakultas(form) {
  await requireAdminSession();
  const parsed = facultySchema.safeParse(catalogInput(form));
  if (!parsed.success)
    return {
      ok: false,
      error: "Nama, kelompok, atau urutan fakultas tidak valid.",
    };
  try {
    const id = String(form.get("id") || "");
    if (id) await prisma.fakultas.update({ where: { id }, data: parsed.data });
    else await prisma.fakultas.create({ data: parsed.data });
    refresh();
    return { ok: true };
  } catch (error) {
    return failure("faculty.save", error);
  }
}
export async function deleteFakultas(form) {
  await requireAdminSession();
  const id = String(form.get("id") || "");
  try {
    await prisma.$transaction(async (tx) => {
      if (await tx.pesanan.count({ where: { fakultasId: id } }))
        await tx.fakultas.update({ where: { id }, data: { aktif: false } });
      else await tx.fakultas.delete({ where: { id } });
    });
    refresh();
    return { ok: true };
  } catch (error) {
    return failure("faculty.delete", error);
  }
}
export async function saveLayanan(form) {
  await requireAdminSession();
  const parsed = serviceSchema.safeParse(catalogInput(form));
  if (!parsed.success)
    return {
      ok: false,
      error: "Lengkapi nama, kategori, tipe, estimasi, dan urutan layanan.",
    };
  try {
    const id = String(form.get("id") || "");
    if (id) await prisma.layanan.update({ where: { id }, data: parsed.data });
    else await prisma.layanan.create({ data: parsed.data });
    refresh();
    return { ok: true };
  } catch (error) {
    return failure("service.save", error);
  }
}
export async function deleteLayanan(form) {
  await requireAdminSession();
  const id = String(form.get("id") || "");
  try {
    await prisma.$transaction(async (tx) => {
      if (await tx.pesanan.count({ where: { layananId: id } }))
        await tx.layanan.update({ where: { id }, data: { aktif: false } });
      else await tx.layanan.delete({ where: { id } });
    });
    refresh();
    return { ok: true };
  } catch (error) {
    return failure("service.delete", error);
  }
}
export async function saveTarif(form) {
  const admin = await requireAdminSession();
  const parsed = z
    .object({
      layananId: z.string().min(1),
      kelompok: z.enum(["SAINTEK", "SOSHUM"]),
      hargaPerUnit: rupiahSchema,
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      ok: false,
      error: "Tarif harus Rupiah bulat dari 0 sampai 2.147.483.647.",
    };
  try {
    await prisma.$transaction(
      async (tx) => {
        const { layananId, kelompok, hargaPerUnit } = parsed.data;
        const service = await tx.layanan.findUniqueOrThrow({
          where: { id: layananId },
        });
        if (service.tipeHitung === "PER_PAKET")
          throw new Error("Paket tidak memakai tarif unit.");
        const where = { layananId_kelompok: { layananId, kelompok } };
        const old = await tx.tarif.findUnique({ where });
        const saved = await tx.tarif.upsert({
          where,
          create: parsed.data,
          update: { hargaPerUnit },
        });
        if (!old || old.hargaPerUnit !== hargaPerUnit)
          await tx.riwayatHarga.create({
            data: {
              entitas: "TARIF",
              referensiId: saved.id,
              keterangan: `${service.nama} (${kelompok})`,
              nilaiLama: old?.hargaPerUnit ?? 0,
              nilaiBaru: hargaPerUnit,
              diubahOleh: admin.username,
            },
          });
      },
      { isolationLevel: "Serializable" },
    );
    refresh();
    return { ok: true };
  } catch (error) {
    return failure("rate.save", error);
  }
}
export async function deleteTarif(form) {
  const admin = await requireAdminSession();
  try {
    await prisma.$transaction(async (tx) => {
      const old = await tx.tarif.delete({
        where: { id: String(form.get("id") || "") },
      });
      await tx.riwayatHarga.create({
        data: {
          entitas: "TARIF",
          referensiId: old.id,
          keterangan: `Tarif dihapus (${old.kelompok})`,
          nilaiLama: old.hargaPerUnit,
          nilaiBaru: 0,
          diubahOleh: admin.username,
        },
      });
    });
    refresh();
    return { ok: true };
  } catch (error) {
    return failure("rate.delete", error);
  }
}
export async function savePaket(form) {
  const admin = await requireAdminSession();
  const parsed = z
    .object({
      layananId: z.string().min(1),
      kelompok: z.enum(["SAINTEK", "SOSHUM"]),
      nama: z.string().trim().min(2).max(100),
      deskripsi: z.string().trim().max(2000),
      harga: rupiahSchema,
      urutan: orderIndexSchema,
    })
    .safeParse(catalogInput(form));
  if (!parsed.success)
    return { ok: false, error: "Nama, harga, atau urutan paket tidak valid." };
  try {
    await prisma.$transaction(
      async (tx) => {
        const id = String(form.get("id") || "");
        const service = await tx.layanan.findUniqueOrThrow({
          where: { id: parsed.data.layananId },
        });
        if (service.tipeHitung !== "PER_PAKET")
          throw new Error("Layanan harus bertipe paket.");
        const old = id
          ? await tx.paket.findUniqueOrThrow({ where: { id } })
          : null;
        const saved = id
          ? await tx.paket.update({ where: { id }, data: parsed.data })
          : await tx.paket.create({ data: parsed.data });
        if (!old || old.harga !== saved.harga)
          await tx.riwayatHarga.create({
            data: {
              entitas: "PAKET",
              referensiId: saved.id,
              keterangan: `${service.nama}: ${saved.nama} (${saved.kelompok})`,
              nilaiLama: old?.harga ?? 0,
              nilaiBaru: saved.harga,
              diubahOleh: admin.username,
            },
          });
      },
      { isolationLevel: "Serializable" },
    );
    refresh();
    return { ok: true };
  } catch (error) {
    return failure("package.save", error);
  }
}
export async function deletePaket(form) {
  const admin = await requireAdminSession();
  try {
    await prisma.$transaction(async (tx) => {
      const old = await tx.paket.delete({
        where: { id: String(form.get("id") || "") },
      });
      await tx.riwayatHarga.create({
        data: {
          entitas: "PAKET",
          referensiId: old.id,
          keterangan: `Paket dihapus: ${old.nama}`,
          nilaiLama: old.harga,
          nilaiBaru: 0,
          diubahOleh: admin.username,
        },
      });
    });
    refresh();
    return { ok: true };
  } catch (error) {
    return failure("package.delete", error);
  }
}
export async function saveBenefit(form) {
  await requireAdminSession();
  const teks = String(form.get("teks") || "").trim();
  const layananId = String(form.get("layananId") || "") || null;
  const paketId = String(form.get("paketId") || "") || null;
  if (
    teks.length < 2 ||
    teks.length > 1000 ||
    Boolean(layananId) === Boolean(paketId)
  )
    return {
      ok: false,
      error: "Isi benefit dan pilih tepat satu layanan atau paket.",
    };
  try {
    const id = String(form.get("id") || "");
    const data = {
      teks,
      layananId,
      paketId,
      urutan: orderIndexSchema.parse(form.get("urutan") || 0),
    };
    if (id) await prisma.benefit.update({ where: { id }, data });
    else await prisma.benefit.create({ data });
    refresh();
    return { ok: true };
  } catch (error) {
    return failure("benefit.save", error);
  }
}
export async function moveBenefit(form) {
  await requireAdminSession();
  const id = String(form.get("id") || "");
  const direction = form.get("direction");
  if (!["up", "down"].includes(direction))
    return { ok: false, error: "Arah urutan tidak valid." };
  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.benefit.findUniqueOrThrow({ where: { id } });
      const siblings = await tx.benefit.findMany({
        where: current.paketId
          ? { paketId: current.paketId }
          : { layananId: current.layananId },
        orderBy: [{ urutan: "asc" }, { id: "asc" }],
      });
      const index = siblings.findIndex((item) => item.id === id);
      const target = index + (direction === "up" ? -1 : 1);
      if (target < 0 || target >= siblings.length) return;
      [siblings[index], siblings[target]] = [siblings[target], siblings[index]];
      for (const [position, item] of siblings.entries())
        await tx.benefit.update({
          where: { id: item.id },
          data: { urutan: position },
        });
    });
    refresh();
    return { ok: true };
  } catch (error) {
    return failure("benefit.move", error);
  }
}
export async function deleteBenefit(form) {
  await requireAdminSession();
  try {
    await prisma.benefit.delete({
      where: { id: String(form.get("id") || "") },
    });
    refresh();
    return { ok: true };
  } catch (error) {
    return failure("benefit.delete", error);
  }
}
export async function updatePesananStatus(form) {
  await requireAdminSession();
  const parsed = z
    .enum(["BARU", "DIPROSES", "SELESAI", "DIBATALKAN"])
    .safeParse(form.get("status"));
  if (!parsed.success)
    return { ok: false, error: "Status pesanan tidak valid." };
  try {
    const id = String(form.get("id") || "");
    const order = await prisma.pesanan.findUniqueOrThrow({
      where: { id },
      include: { pembayaran: true },
    });
    if (order.deletedAt || order.pembayaran)
      return {
        ok: false,
        error: "Pesanan pembayaran dikelola melalui menu Pembayaran.",
      };
    await prisma.pesanan.update({
      where: { id },
      data: {
        status: parsed.data,
        catatanAdmin: String(form.get("catatanAdmin") || "").slice(0, 2000),
      },
    });
    refresh();
    return { ok: true };
  } catch (error) {
    return failure("order.status", error);
  }
}
export async function softDeletePesanan(form) {
  await requireAdminSession();
  try {
    const id = String(form.get("id") || "");
    await prisma.$transaction([
      prisma.pesanan.update({ where: { id }, data: { deletedAt: new Date() } }),
      prisma.pembayaran.updateMany({
        where: { pesananId: id },
        data: { deletedAt: new Date() },
      }),
    ]);
    refresh();
    return { ok: true };
  } catch (error) {
    return failure("order.delete", error);
  }
}
export async function verifyTurnitinPayment(form) {
  const admin = await requireAdminSession();
  try {
    await prisma.$transaction(
      async (tx) => {
        const payment = await tx.pembayaran.findUniqueOrThrow({
          where: { id: String(form.get("pembayaranId") || "") },
          include: { pesanan: true },
        });
        if (
          payment.deletedAt ||
          payment.pesanan.deletedAt ||
          payment.status !== "MENUNGGU_VERIFIKASI" ||
          !payment.buktiPublicId
        )
          throw new Error("Bukti belum tersedia.");
        await tx.pembayaran.update({
          where: { id: payment.id },
          data: {
            status: "DIBAYAR",
            diverifikasiOleh: admin.username,
            dibayarPada: new Date(),
          },
        });
        await tx.pesanan.update({
          where: { id: payment.pesananId },
          data: { status: "DIBAYAR" },
        });
      },
      { isolationLevel: "Serializable" },
    );
    refresh();
    return { ok: true };
  } catch (error) {
    return failure("payment.verify", error);
  }
}
export async function rejectTurnitinPayment(form) {
  const admin = await requireAdminSession();
  try {
    await prisma.$transaction(
      async (tx) => {
        const payment = await tx.pembayaran.findUniqueOrThrow({
          where: { id: String(form.get("pembayaranId") || "") },
        });
        if (payment.deletedAt || payment.status !== "MENUNGGU_VERIFIKASI")
          throw new Error("Status pembayaran tidak sesuai.");
        await tx.pembayaran.update({
          where: { id: payment.id },
          data: { status: "DITOLAK", diverifikasiOleh: admin.username },
        });
        await tx.pesanan.update({
          where: { id: payment.pesananId },
          data: { status: "DIBATALKAN" },
        });
      },
      { isolationLevel: "Serializable" },
    );
    refresh();
    return { ok: true };
  } catch (error) {
    return failure("payment.reject", error);
  }
}
export async function uploadTurnitinResultPdf(form) {
  await requireAdminSession();
  let upload;
  try {
    const payment = await prisma.pembayaran.findUniqueOrThrow({
      where: { id: String(form.get("pembayaranId") || "") },
      include: { pesanan: true },
    });
    if (
      payment.deletedAt ||
      payment.pesanan.deletedAt ||
      payment.status !== "DIBAYAR"
    )
      return {
        ok: false,
        error: "Verifikasi pembayaran sebelum mengunggah hasil.",
      };
    upload = await uploadFile(
      form.get("hasilPdfFile"),
      "studio_turnitin_results",
      { pdf: true, private: true },
    );
    await prisma.$transaction([
      prisma.pembayaran.update({
        where: { id: payment.id },
        data: { hasilPublicId: upload.public_id, hasilPdfUrl: null },
      }),
      prisma.pesanan.update({
        where: { id: payment.pesananId },
        data: { status: "SELESAI" },
      }),
    ]);
    refresh();
    return { ok: true };
  } catch (error) {
    if (upload)
      await removeUpload(upload.public_id, { pdf: true, private: true }).catch(
        () => {},
      );
    return failure("payment.result", error);
  }
}
export async function savePengaturan(form) {
  await requireAdminSession();
  const parsed = z
    .object({
      nomorWhatsApp: z.string().regex(/^62[0-9]{7,13}$/),
      namaRekening: z.string().trim().max(120),
      syaratKetentuan: z.string().trim().max(30000),
      kebijakanPrivasi: z.string().trim().max(30000),
      instagramUrl: z
        .string()
        .url()
        .refine((value) => {
          const u = new URL(value);
          return (
            u.protocol === "https:" &&
            ["instagram.com", "www.instagram.com"].includes(u.hostname)
          );
        }),
      emailKontak: z.string().email().max(250),
      calendlyUrl: z
        .string()
        .max(500)
        .refine((value) => !value || /^https:\/\/calendly\.com\//.test(value)),
      jumlahKlienDibantu: z.union([
        z.null(),
        z.coerce.number().int().min(0).max(2147483647),
      ]),
      turnitinAktif: z.boolean(),
      turnitinMaksMb: z.coerce.number().int().min(1).max(4),
      turnitinBatasJam: z.coerce.number().int().min(1).max(168),
    })
    .safeParse({
      ...Object.fromEntries(form),
      nomorWhatsApp: String(form.get("nomorWhatsApp") || "").replace(/\D/g, ""),
      calendlyUrl: String(form.get("calendlyUrl") || ""),
      jumlahKlienDibantu:
        form.get("jumlahKlienDibantu") === ""
          ? null
          : form.get("jumlahKlienDibantu"),
      turnitinAktif: form.get("turnitinAktif") === "true",
      turnitinMaksMb: form.get("turnitinMaksMb") || 4,
      turnitinBatasJam: form.get("turnitinBatasJam") || 24,
    });
  if (!parsed.success)
    return {
      ok: false,
      error:
        "Periksa nomor WhatsApp (628...), URL Instagram/Calendly, email, dan angka pengaturan.",
    };
  let upload;
  try {
    const old = await prisma.pengaturan.findUnique({
      where: { id: "default" },
    });
    const file = form.get("qrisFile");
    if (file && typeof file !== "string" && file.size)
      upload = await uploadFile(file, "studio_qris");
    if (parsed.data.turnitinAktif && !(upload || old?.qrisImageUrl))
      return { ok: false, error: "Unggah QRIS sebelum mengaktifkan Turnitin." };
    const data = {
      ...parsed.data,
      turnitinFormat: "application/pdf",
      ...(upload ? { qrisImageUrl: upload.secure_url } : {}),
    };
    await prisma.pengaturan.upsert({
      where: { id: "default" },
      update: data,
      create: data,
    });
    refresh();
    return { ok: true };
  } catch (error) {
    if (upload) await removeUpload(upload.public_id).catch(() => {});
    return failure("settings.save", error);
  }
}
