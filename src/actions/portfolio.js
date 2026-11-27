"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import { requireAdminSession } from "../lib/auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function tambahPortfolio(formData) {
  await requireAdminSession();

  try {
    const judul = String(formData.get("judul") || "").trim();
    const kategori = String(formData.get("kategori") || "").trim();
    const file = formData.get("imageFile");

    if (!judul || !kategori) {
      throw new Error("Judul dan kategori wajib diisi.");
    }
    if (!file || typeof file === "string" || file.size === 0) {
      throw new Error("Mohon pilih file gambar terlebih dahulu.");
    }
    if (file.size > 4000000) {
      throw new Error("File terlalu besar. Maksimal ukuran adalah 4MB.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "portfolio_studio",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    await prisma.portfolio.create({
      data: {
        judul,
        kategori,
        imageUrl: uploadResponse.secure_url,
      },
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/portofolio");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Gagal Upload Portfolio:", error.message);
    return { success: false, error: error.message };
  }
}

export async function hapusPortfolio(formData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");
  try {
    await prisma.portfolio.delete({ where: { id } });
    revalidatePath("/admin/dashboard");
    revalidatePath("/portofolio");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Gagal hapus portfolio:", error);
    return { success: false, error: "Gagal menghapus portofolio." };
  }
}
