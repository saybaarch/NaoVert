import { NextRequest, NextResponse } from "next/server";
import { pastikanAkses } from "@/lib/server/gobiz-auth";
import {
  ambilTantangan,
  hapusTantangan,
  pesanGalat,
  statusGalat,
  verifyOtp,
} from "@/lib/server/gobiz";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const denied = pastikanAkses(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const challenge = ambilTantangan(String(body.challengeId || ""));
    if (!challenge) {
      return NextResponse.json(
        { message: "Permintaan OTP tidak ditemukan atau sudah kedaluwarsa. Minta OTP baru." },
        { status: 400 },
      );
    }

    const session = await verifyOtp({
      phone: challenge.phone,
      otp: String(body.otp || ""),
      otpToken: challenge.otpToken,
      deviceId: challenge.deviceId,
    });
    hapusTantangan(String(body.challengeId || ""));
    return NextResponse.json({
      connected: true,
      phone: session.phone_number,
      outlet: session.outlet_name,
      merchant_id: session.merchant_id,
      expires_at: session.expires_at,
    });
  } catch (error) {
    return NextResponse.json(
      { message: pesanGalat(error) },
      { status: statusGalat(error) },
    );
  }
}
