import { NextResponse } from "next/server";
import { verifySessionToken } from "./lib/sessionToken";

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  const isLoginPage = path === "/admin/login";
  const token = request.cookies.get("admin_session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (path.startsWith("/admin/dashboard") && !session) {
    const response = NextResponse.redirect(new URL("/admin/login", request.nextUrl));
    if (token) {
      response.cookies.delete("admin_session");
    }
    return response;
  }

  if (isLoginPage && session) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/login"],
};
