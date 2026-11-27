import { NextRequest, NextResponse } from "next/server";
import { buatPesanan } from "@/lib/server/pesanan";
import { bacaSesi, pesanGalat, statusGalat } from "@/lib/server/gobiz";

export const runtime = "nodejs";

function balas(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!(await bacaSesi())) {
    return balas(
      { message: "Pembayaran QRIS belum tersambung ke merchant. Hubungi Sayba Arc untuk sementara." },
      503,
    );
  }
  try {
    const isi = (await request.json().catch(() => ({}))) as { paket?: string; email?: string };
    const pesanan = await buatPesanan({ paket: String(isi.paket || ""), email: isi.email });
    return balas({ pesanan }, 201);
  } catch (error) {
    return balas({ message: pesanGalat(error) }, statusGalat(error));
  }
}
