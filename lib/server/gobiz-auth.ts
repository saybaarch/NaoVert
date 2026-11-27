import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE = "naovert_gobiz_admin";

function adminKey() {
  return process.env.GOBIZ_ADMIN_KEY || "";
}

function adminToken() {
  return createHmac("sha256", adminKey()).update("naovert-gobiz-admin-v1").digest("hex");
}

export function sama(a: unknown, b: string) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function hostname(request: NextRequest) {
  const raw = (request.headers.get("host") || request.nextUrl.host).trim().toLowerCase();
  if (raw.startsWith("[")) {
    const end = raw.indexOf("]");
    return end >= 0 ? raw.slice(0, end + 1) : raw;
  }
  return raw.split(":")[0];
}

export function tolakRemote(request: NextRequest) {
  if (process.env.GOBIZ_ALLOW_REMOTE === "1") return null;
  const host = hostname(request);
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "::1") {
    return null;
  }
  return NextResponse.json(
    { message: "Alat GoBiz ini hanya boleh dijalankan dari localhost." },
    { status: 403 },
  );
}

export function pastikanAkses(request: NextRequest) {
  const key = adminKey();
  if (!key) {
    return NextResponse.json(
      { message: "GOBIZ_ADMIN_KEY belum diatur di server." },
      { status: 503 },
    );
  }
  const remote = tolakRemote(request);
  if (remote) return remote;
  if (!sama(request.cookies.get(COOKIE)?.value, adminToken())) {
    return NextResponse.json({ message: "Kunci admin salah." }, { status: 401 });
  }
  return null;
}

export function pasangCookieAdmin(request: NextRequest, response: NextResponse) {
  response.cookies.set(COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
