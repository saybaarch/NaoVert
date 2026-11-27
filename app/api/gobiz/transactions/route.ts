import { NextRequest, NextResponse } from "next/server";
import { pastikanAkses } from "@/lib/server/gobiz-auth";
import { ambilTransaksi, pesanGalat, statusGalat } from "@/lib/server/gobiz";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const denied = pastikanAkses(request);
  if (denied) return denied;

  try {
    const rawMinutes = Number(request.nextUrl.searchParams.get("minutes") || 90);
    const minutes = Math.min(1440, Math.max(5, Number.isFinite(rawMinutes) ? rawMinutes : 90));
    const transactions = await ambilTransaksi(minutes);
    return NextResponse.json({ transactions, count: transactions.length });
  } catch (error) {
    return NextResponse.json(
      { message: pesanGalat(error) },
      { status: statusGalat(error) },
    );
  }
}
