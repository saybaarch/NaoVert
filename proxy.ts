import { NextResponse, type NextRequest } from "next/server";

/*
 * Pagar panel admin.
 *
 * Panel GoBiz dan seluruh API-nya hanya hidup di komputer pemilik merchant:
 * sesi merchant terikat mesin, dan kunci admin disimpan lokal. Di alamat
 * publik panel ini tidak boleh bahkan terlihat, jadi permintaan dari host
 * selain localhost ditolak di sini sebelum menyentuh halaman atau API.
 *
 * GOBIZ_ALLOW_REMOTE=1 adalah satu satunya cara membukanya, dan itu pun
 * hanya untuk terowongan lokal yang disengaja.
 */

function hostPublik(request: NextRequest) {
  const host = (request.headers.get("host") || "").trim().toLowerCase();
  const polos = host.startsWith("[")
    ? host.slice(0, host.indexOf("]") + 1)
    : host.split(":")[0];
  return !["localhost", "127.0.0.1", "[::1]", "::1"].includes(polos);
}

export default function proxy(request: NextRequest) {
  if (process.env.GOBIZ_ALLOW_REMOTE === "1") return NextResponse.next();
  if (!hostPublik(request)) return NextResponse.next();

  return new NextResponse("Tidak ditemukan.", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
}

export const config = {
  matcher: ["/gobiz/:path*", "/admin/:path*", "/api/gobiz/:path*"],
};
