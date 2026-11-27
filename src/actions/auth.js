"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../lib/prisma";
import {
  clearAdminSession,
  createAdminSession,
  verifyPassword,
} from "../lib/auth";
import { checkRateLimit, resetRateLimit } from "../lib/rateLimit";

export async function loginAdmin(formData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    return { error: "Username dan password wajib diisi." };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rateKey = `login:${ip}:${username.toLowerCase()}`;
  const rate = checkRateLimit(rateKey, { limit: 5, windowMs: 15 * 60 * 1000 });

  if (!rate.allowed) {
    return { error: "Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit." };
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      return { error: "Username atau password salah." };
    }

    resetRateLimit(rateKey);
    await createAdminSession(admin);
  } catch (error) {
    console.error("Gagal memproses login admin:", error);
    return { error: "Layanan autentikasi sedang tidak tersedia. Periksa koneksi database." };
  }

  redirect("/admin/dashboard");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}
