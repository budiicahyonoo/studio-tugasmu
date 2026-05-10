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

    if (!file || file.size === 0) {
      throw new Error("Mohon pilih file gambar terlebih dahulu.");
    }

    // Insight: Batasi ukuran file (4MB) untuk mencegah Timeout di Vercel
    if (file.size > 4000000) {
      throw new Error("File terlalu besar. Maksimal ukuran adalah 4MB.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Insight: Alur upload dibungkus dalam Promise yang lebih rapi
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "portfolio_studio",
          resource_type: "auto" 
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

    // Insight: Melakukan refresh data di dashboard & halaman utama
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    
    return { success: true };

  } catch (error) {
    console.error("Gagal Upload Portfolio:", error.message);
    // Mengembalikan error sebagai data agar UI tidak crash total
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