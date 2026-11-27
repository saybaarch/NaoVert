import { NextRequest, NextResponse } from "next/server";
import { ambilPesanan } from "@/lib/server/pesanan";
import { pesanGalat, statusGalat } from "@/lib/server/gobiz";

export const runtime = "nodejs";

function balas(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(
  _request: NextRequest,
  konteks: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await konteks.params;
    return balas({ pesanan: await ambilPesanan(id) });
  } catch (error) {
    return balas({ message: pesanGalat(error) }, statusGalat(error));
  }
}
