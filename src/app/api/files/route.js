import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getAdminSession } from "../../../lib/auth";
import { privateDownload } from "../../../lib/uploads";
export const dynamic = "force-dynamic";
export async function GET(request) {
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  if (!["dokumen", "bukti", "hasil"].includes(kind))
    return new NextResponse("File tidak ditemukan.", { status: 404 });
  const code = url.searchParams.get("code") || "";
  const admin = await getAdminSession();
  if (!admin && (kind !== "hasil" || !/^TRN-[A-F0-9]{40}$/.test(code)))
    return new NextResponse("Akses ditolak.", { status: 403 });
  try {
    const payment =
      admin && url.searchParams.get("payment")
        ? await prisma.pembayaran.findUnique({
            where: { id: url.searchParams.get("payment") },
            include: { pesanan: true },
          })
        : await prisma.pembayaran.findFirst({
            where: { pesanan: { kodePesanan: code, deletedAt: null } },
            include: { pesanan: true },
          });
    if (
      !payment ||
      payment.deletedAt ||
      payment.pesanan.deletedAt ||
      (!admin && payment.pesanan.status !== "SELESAI")
    )
      return new NextResponse("File tidak ditemukan.", { status: 404 });
    const id =
      kind === "dokumen"
        ? payment.dokumenPublicId
        : kind === "bukti"
          ? payment.buktiPublicId
          : payment.hasilPublicId;
    if (!id) return new NextResponse("File belum tersedia.", { status: 404 });
    const response = NextResponse.redirect(
      privateDownload(id, kind !== "bukti"),
    );
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch {
    return new NextResponse("File belum dapat dimuat.", { status: 503 });
  }
}
