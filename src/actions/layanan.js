"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

// Fungsi untuk menambah layanan baru
export async function tambahLayanan(formData) {
  const kategori = formData.get("kategori");
  const namaLayanan = formData.get("namaLayanan");
  const hargaDasar = parseInt(formData.get("hargaDasar"));

  await prisma.layanan.create({
    data: {
      kategori,
      namaLayanan,
      hargaDasar,
    },
  });

  // Refresh halaman otomatis setelah data masuk
  revalidatePath("/admin/dashboard");
}

// Fungsi untuk menghapus layanan
export async function hapusLayanan(formData) {
  const id = formData.get("id");
  
  await prisma.layanan.delete({
    where: { id },
  });

  revalidatePath("/admin/dashboard");
}