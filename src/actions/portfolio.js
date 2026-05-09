"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function tambahPortfolio(formData) {
  try {
    const judul = formData.get("judul");
    const kategori = formData.get("kategori");
    const file = formData.get("imageFile");

    console.log("--- Memulai Proses Upload ---");
    console.log("Judul:", judul);

    if (!file || file.size === 0) {
      throw new Error("Mohon pilih file gambar terlebih dahulu.");
    }

    // 1. Konversi ke Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("1. File berhasil diubah ke buffer.");

    // 2. Upload ke Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "portfolio_studio",
          resource_type: "auto" 
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Error:", error);
            return reject(error);
          }
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    console.log("2. Upload Cloudinary Berhasil. URL:", uploadResponse.secure_url);

    // 3. Simpan ke Database Prisma/Supabase
    const hasilDb = await prisma.portfolio.create({
      data: {
        judul,
        kategori,
        imageUrl: uploadResponse.secure_url,
      },
    });

    console.log("3. Berhasil simpan ke Database dengan ID:", hasilDb.id);

    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    
    return { success: true };

  } catch (error) {
    console.error("ALUR GAGAL DI SINI:", error);
    return { success: false, error: error.message };
  }
}

export async function hapusPortfolio(formData) {
  const id = formData.get("id");
  try {
    await prisma.portfolio.delete({ where: { id } });
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
  } catch (error) {
    console.error("Gagal hapus portfolio:", error);
  }
}