import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { signSessionToken, verifySessionToken } from "./sessionToken";
import { prisma } from "./prisma";

export const ADMIN_COOKIE_NAME = "admin_session";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password, storedHash) {
  if (
    !storedHash ||
    typeof storedHash !== "string" ||
    !storedHash.includes(":")
  ) {
    return false;
  }
  if (
    !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(storedHash) ||
    typeof password !== "string" ||
    password.length > 1024
  )
    return false;
  const [salt, keyHex] = storedHash.split(":");
  const keyBuffer = Buffer.from(keyHex, "hex");
  const derivedBuffer = scryptSync(password, salt, 64);
  if (keyBuffer.length !== derivedBuffer.length) return false;
  return timingSafeEqual(keyBuffer, derivedBuffer);
}

export async function createAdminSession(admin) {
  const token = await signSessionToken({
    sub: admin.id,
    username: admin.username,
    nama: admin.nama,
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload || typeof payload.sub !== "string") return null;
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true, nama: true },
    });
    return admin
      ? { sub: admin.id, username: admin.username, nama: admin.nama }
      : null;
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Sesi admin tidak valid atau sudah berakhir.");
  }
  return session;
}
