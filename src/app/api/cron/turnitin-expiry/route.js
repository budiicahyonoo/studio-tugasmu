import { NextResponse } from "next/server";
import { expireExpiredTurnitinPayments } from "../../../../lib/turnitinExpiry";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret)
    return NextResponse.json(
      { error: "Jadwal kedaluwarsa belum dikonfigurasi." },
      { status: 503 },
    );
  if (request.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });

  try {
    const result = await expireExpiredTurnitinPayments({ limit: 500 });
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json(
      { error: "Status pembayaran belum dapat diperbarui." },
      { status: 503 },
    );
  }
}
