"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";
import { requireAdminSession } from "../lib/auth";
import { faqSchema, orderIndexSchema, publicError } from "../lib/validation";
import { removeUpload, uploadFile } from "../lib/uploads";

function refreshContent() {
  [
    "/",
    "/faq",
    "/ulasan",
    "/simulasi",
    "/layanan",
    "/tarif",
    "/admin/dashboard",
  ].forEach((path) => revalidatePath(path));
}

export async function saveFaq(form) {
  await requireAdminSession();
  const parsed = faqSchema.safeParse({
    ...Object.fromEntries(form),
    tampil: form.get("tampil") === "true",
  });
  if (!parsed.success)
    return {
      ok: false,
      error:
        "Isi pertanyaan, jawaban, dan pasangan tombol dengan tujuan halaman yang valid.",
    };
  try {
    const id = String(form.get("id") || "");
    if (id) await prisma.faq.update({ where: { id }, data: parsed.data });
    else await prisma.faq.create({ data: parsed.data });
    refreshContent();
    return { ok: true };
  } catch (error) {
    publicError("faq.save", error);
    return { ok: false, error: "FAQ belum tersimpan. Coba lagi." };
  }
}

export async function deleteFaq(form) {
  await requireAdminSession();
  try {
    await prisma.faq.delete({ where: { id: String(form.get("id") || "") } });
    refreshContent();
    return { ok: true };
  } catch {
    return { ok: false, error: "FAQ belum terhapus." };
  }
}

export async function saveGallery(form) {
  await requireAdminSession();
  const parsed = z
    .object({
      label: z.string().trim().min(2).max(100),
      urutan: orderIndexSchema,
      tampil: z.boolean(),
    })
    .safeParse({
      label: form.get("label"),
      urutan: form.get("urutan"),
      tampil: form.get("tampil") === "true",
    });
  if (!parsed.success)
    return { ok: false, error: "Label dan urutan foto tidak valid." };
  const id = String(form.get("id") || "");
  const file = form.get("image");
  let upload;
  try {
    const existing = id
      ? await prisma.galeriUlasan.findUniqueOrThrow({ where: { id } })
      : null;
    if (!id || (file && typeof file !== "string" && file.size))
      upload = await uploadFile(file, "studio_ulasan");
    if (upload && (!upload.width || !upload.height))
      throw new Error("Dimensi gambar tidak dapat dibaca.");
    const data = {
      ...parsed.data,
      ...(upload
        ? {
            imageUrl: upload.secure_url,
            publicId: upload.public_id,
            lebar: upload.width,
            tinggi: upload.height,
          }
        : {}),
    };
    const old = id
      ? await prisma.galeriUlasan.update({ where: { id }, data })
      : await prisma.galeriUlasan.create({ data });
    if (upload && existing?.publicId)
      await removeUpload(existing.publicId).catch((error) =>
        publicError("gallery.cleanup", error),
      );
    refreshContent();
    return { ok: true, id: old.id };
  } catch (error) {
    if (upload) await removeUpload(upload.public_id).catch(() => {});
    publicError("gallery.save", error);
    return {
      ok: false,
      error:
        error?.message?.startsWith("Pilih") ||
        error?.message?.startsWith("Format") ||
        error?.message?.startsWith("Ukuran") ||
        error?.message?.startsWith("Isi file")
          ? error.message
          : "Foto belum tersimpan. Periksa file dan koneksi.",
    };
  }
}

export async function deleteGallery(form) {
  await requireAdminSession();
  try {
    const photo = await prisma.galeriUlasan.delete({
      where: { id: String(form.get("id") || "") },
    });
    if (photo.publicId)
      await removeUpload(photo.publicId).catch((error) =>
        publicError("gallery.cleanup", error),
      );
    refreshContent();
    return { ok: true };
  } catch {
    return { ok: false, error: "Foto belum terhapus." };
  }
}

export async function saveKategori(form) {
  await requireAdminSession();
  const parsed = z
    .object({
      id: z.string().regex(/^[A-Z0-9_]{2,40}$/),
      nama: z.string().trim().min(2).max(80),
      urutan: orderIndexSchema,
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return {
      ok: false,
      error: "Gunakan kode kategori huruf besar, nama, dan urutan yang valid.",
    };
  try {
    await prisma.kategori.upsert({
      where: { id: parsed.data.id },
      create: parsed.data,
      update: parsed.data,
    });
    refreshContent();
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Kategori belum tersimpan. Nama kategori harus unik.",
    };
  }
}

export async function deleteKategori(form) {
  await requireAdminSession();
  try {
    await prisma.kategori.delete({
      where: { id: String(form.get("id") || "") },
    });
    refreshContent();
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        "Kategori masih digunakan layanan. Pindahkan layanan sebelum menghapus.",
    };
  }
}
