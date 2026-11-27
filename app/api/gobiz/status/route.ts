import { NextRequest, NextResponse } from "next/server";
import { pastikanAkses } from "@/lib/server/gobiz-auth";
import { bacaSesi } from "@/lib/server/gobiz";
import { NOMINAL_UJI } from "@/lib/server/qris";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const denied = pastikanAkses(request);
  if (denied) return denied;

  const session = await bacaSesi();
  const settings = {
    auth_mode: "OTP merchant internal",
    client_id: "go-biz-web-new",
    otp_endpoint: "https://api.gobiz.co.id/goid/login/request",
    token_endpoint: "https://api.gobiz.co.id/goid/token",
    config_endpoint: "https://api.gobiz.co.id/goresto/v5/public/users/config",
    transactions_endpoint:
      "https://api.gojekapi.com/merchant-analytics/v2/merchants/transactions",
    local_only: process.env.GOBIZ_ALLOW_REMOTE !== "1",
    qris_payload_configured: Boolean(process.env.QRIS_PAYLOAD),
    qris_test_amount: NOMINAL_UJI,
    checkout_active: false,
  };

  return NextResponse.json(
    {
      connected: Boolean(session),
      phone: session?.phone_number,
      outlet: session?.outlet_name,
      merchant_id: session?.merchant_id,
      expires_at: session?.expires_at,
      settings,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
