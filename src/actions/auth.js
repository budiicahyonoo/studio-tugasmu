"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../lib/prisma";
import {
  clearAdminSession,
  createAdminSession,
  verifyPassword,
} from "../lib/auth";
import { checkRateLimit, resetRateLimit } from "../lib/persistentRateLimit";
import { publicError } from "../lib/validation";

export async function loginAdmin(formData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (
    !username ||
    !password ||
    username.length > 100 ||
    password.length > 1024
  ) {
    return { error: "Username dan password wajib diisi." };
  }

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rateKey = `login:${ip}:${username.toLowerCase()}`;
  const rate = await checkRateLimit(rateKey, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rate.allowed) {
    return {
      error: "Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.",
    };
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      return { error: "Username atau password salah." };
    }

    await resetRateLimit(rateKey);
    await createAdminSession(admin);
  } catch (error) {
    publicError("auth.login", error);
    return {
      error:
        "Layanan autentikasi sedang tidak tersedia. Periksa koneksi database.",
    };
  }

  redirect("/admin/dashboard");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}
