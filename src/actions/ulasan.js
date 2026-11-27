"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAdminSession } from "../lib/auth";

const ulasanSchema = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 karakter.").max(80),
  role: z.string().trim().min(2, "Peran minimal 2 karakter.").max(80),
  teks: z.string().trim().min(10, "Ulasan minimal 10 karakter.").max(1000),
});

export async function tambahUlasan(formData) {
  const parsed = ulasanSchema.safeParse({
    nama: formData.get("nama"),
    role: formData.get("role"),
    teks: formData.get("teks"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Data ulasan tidak valid.",
    };
  }

  await prisma.ulasan.create({
    data: {
      ...parsed.data,
      rating: 5,
      status: "PENDING",
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export async function setujuiUlasan(formData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");

  await prisma.ulasan.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  return { ok: true };
}

export async function hapusUlasan(formData) {
  await requireAdminSession();
  const id = String(formData.get("id") || "");

  await prisma.ulasan.delete({
    where: { id },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  return { ok: true };
}
