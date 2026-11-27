import { NextRequest, NextResponse } from "next/server";
import { pastikanAkses } from "@/lib/server/gobiz-auth";
import { pesanGalat, requestOtp, simpanTantangan, statusGalat } from "@/lib/server/gobiz";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const denied = pastikanAkses(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const result = await requestOtp(String(body.phone || ""));
    const challengeId = simpanTantangan(result, result.expiresIn);
    return NextResponse.json({
      challengeId,
      phone: `+62${result.phone}`,
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    return NextResponse.json(
      { message: pesanGalat(error) },
      { status: statusGalat(error) },
    );
  }
}
