"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAdmin(formData) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (username === "admin" && password === "tugasmu123") {
    // TAMBAHKAN AWAIT DI SINI UNTUK NEXT.JS TERBARU
    const cookieStore = await cookies();
    
    cookieStore.set("admin_session", "true", { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 // 24 jam
    });
    
    redirect("/admin/dashboard");
  } else {
    return { error: "Username atau Password salah!" };
  }
}

export async function logoutAdmin() {
  // TAMBAHKAN AWAIT DI SINI JUGA
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  
  redirect("/admin/login");
}