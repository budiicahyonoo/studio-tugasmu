import { NextResponse } from "next/server";
import { verifySessionToken } from "./lib/sessionToken";

export async function proxy(request) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("admin_session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (path.startsWith("/admin/dashboard") && !session) {
    const response = NextResponse.redirect(
      new URL("/admin/login", request.nextUrl),
    );
    if (token) {
      response.cookies.delete("admin_session");
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/login"],
};
