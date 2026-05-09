"use server";

import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

// Fungsi untuk pengunjung submit ulasan
export async function tambahUlasan(formData) {
  const nama = formData.get("nama");
  const role = formData.get("role");
  const teks = formData.get("teks");

  await prisma.ulasan.create({
    data: {
      nama,
      role,
      teks,
      rating: 5, // Default kita set bintang 5
    },
  });

  revalidatePath("/"); // Refresh halaman depan agar data terupdate
}

// Fungsi untuk Admin menyetujui ulasan
export async function setujuiUlasan(formData) {
  const id = formData.get("id");
  
  await prisma.ulasan.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}

// Fungsi untuk Admin menghapus/menolak ulasan
export async function hapusUlasan(formData) {
  const id = formData.get("id");
  
  await prisma.ulasan.delete({
    where: { id },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
}