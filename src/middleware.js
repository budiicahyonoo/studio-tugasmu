import { NextResponse } from "next/server";

export function middleware(request) {
  const path = request.nextUrl.pathname;
  const isLoginPage = path === "/admin/login";
  
  // Mengecek apakah pengunjung bawa tiket (cookie)
  const hasToken = request.cookies.get("admin_session")?.value || "";

  // Jika mencoba masuk ke dashboard tanpa tiket, usir ke login
  if (path.startsWith("/admin/dashboard") && !hasToken) {
    return NextResponse.redirect(new URL("/admin/login", request.nextUrl));
  }

  // Jika sudah login tapi mencoba buka halaman login lagi, arahkan ke dashboard
  if (isLoginPage && hasToken) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.nextUrl));
  }

  return NextResponse.next();
}

// Menentukan rute mana saja yang dijaga satpam ini
export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/login"],
};