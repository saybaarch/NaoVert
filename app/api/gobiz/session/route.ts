import { NextRequest, NextResponse } from "next/server";
import { pastikanAkses } from "@/lib/server/gobiz-auth";
import { hapusSesi } from "@/lib/server/gobiz";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  const denied = pastikanAkses(request);
  if (denied) return denied;

  await hapusSesi();
  return NextResponse.json({ connected: false });
}
