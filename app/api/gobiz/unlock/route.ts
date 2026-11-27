import { NextRequest, NextResponse } from "next/server";
import { pasangCookieAdmin, sama, tolakRemote } from "@/lib/server/gobiz-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const remote = tolakRemote(request);
  if (remote) return remote;

  const key = process.env.GOBIZ_ADMIN_KEY || "";
  if (!key) {
    return NextResponse.json({ message: "GOBIZ_ADMIN_KEY belum diatur di server." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  if (!sama(body.key, key)) {
    return NextResponse.json({ message: "Kunci admin salah." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  pasangCookieAdmin(request, response);
  return response;
}
