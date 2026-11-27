import { NextRequest, NextResponse } from "next/server";
import { pastikanAkses } from "@/lib/server/gobiz-auth";
import { bacaSesi, pesanGalat, statusGalat } from "@/lib/server/gobiz";
import { buatQrisUji, hapusQrisUji, statusQrisUji } from "@/lib/server/qris";

export const runtime = "nodejs";

function balas(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const denied = pastikanAkses(request);
  if (denied) return denied;
  if (!(await bacaSesi())) {
    return balas({ message: "Sesi GoBiz belum ada. Hubungkan merchant di /gobiz dulu." }, 401);
  }
  try {
    return balas(await buatQrisUji(), 201);
  } catch (error) {
    return balas({ message: pesanGalat(error) }, statusGalat(error));
  }
}

export async function GET(request: NextRequest) {
  const denied = pastikanAkses(request);
  if (denied) return denied;
  try {
    return balas({ order: await statusQrisUji() });
  } catch (error) {
    return balas({ message: pesanGalat(error) }, statusGalat(error));
  }
}

export async function DELETE(request: NextRequest) {
  const denied = pastikanAkses(request);
  if (denied) return denied;
  await hapusQrisUji();
  return balas({ order: null });
}
