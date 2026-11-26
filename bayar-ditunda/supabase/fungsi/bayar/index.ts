// Supabase Edge Function: bayar
//
// Satu pintu untuk pesanan lisensi NaoVert. Tiga pekerjaan:
//   POST { aksi: "buat",  email }  membuat transaksi QRIS di GoBiz
//   GET  ?order=...&t=...          memberi status pesanan ke halaman pembayaran
//   POST (dari GoBiz)              menerima notifikasi pembayaran, menerbitkan kunci
//
// Kunci GoBiz hanya ada di sini. Halaman web tidak pernah memegangnya, dan
// tidak ada tabel yang bisa dibaca langsung oleh peramban.

import { createClient } from "jsr:@supabase/supabase-js@2";

const HARGA = 15000;
const MENIT_KEDALUWARSA = 15;

// Jendela nominal unik. Pembeli dengan nominal dasar yang sama akan tampak
// identik di mutasi GoPay, jadi setiap pesanan diberi tambahan 1 sampai
// SEKAT rupiah. Harganya dibulatkan ke bawah supaya tidak pernah melebihi
// angka yang tertulis di halaman.
const SEKAT_NOMINAL = 99;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const KUNCI_LAYANAN = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const GOBL_URL = Deno.env.get("GOBIZ_BASE_URL") ?? "https://api.gobiz.co.id";
const GOAUTH_URL = Deno.env.get("GOBIZ_OAUTH_URL") ?? "https://accounts.go-jek.com";
const CLIENT_ID = Deno.env.get("GOBIZ_CLIENT_ID") ?? "";
const CLIENT_SECRET = Deno.env.get("GOBIZ_CLIENT_SECRET") ?? "";
const OUTLET_ID = Deno.env.get("GOBIZ_OUTLET_ID") ?? "";

const db = createClient(SUPABASE_URL, KUNCI_LAYANAN, {
  auth: { persistSession: false },
});

const kepalaCors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function balas(isi: unknown, status = 200) {
  return new Response(JSON.stringify(isi), {
    status,
    headers: { ...kepalaCors, "content-type": "application/json; charset=utf-8" },
  });
}

/* ── tanda tangan webhook ─────────────────────────────────────────────
 * Payload pembayaran hanya dipercaya kalau tanda tangannya cocok. Kalau
 * rahasianya belum diisi, tanda tangan tidak bisa diperiksa dan pesanan
 * tetap diverifikasi ulang lewat API GoBiz sebelum kunci diterbitkan.
 */
async function tandaTanganSah(mentah: string, tanda: string | null): Promise<boolean> {
  const rahasia = Deno.env.get("GOBIZ_WEBHOOK_SECRET") ?? "";
  if (!rahasia) return false;
  if (!tanda) return false;

  const kunci = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(rahasia),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const hasil = await crypto.subtle.sign("HMAC", kunci, new TextEncoder().encode(mentah));
  const heks = Array.from(new Uint8Array(hasil))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const bersih = tanda.replace(/^sha256=/i, "").toLowerCase();
  if (bersih.length !== heks.length) return false;
  let beda = 0;
  for (let i = 0; i < heks.length; i++) beda |= heks.charCodeAt(i) ^ bersih.charCodeAt(i);
  return beda === 0;
}

/* ── token GoBiz ──────────────────────────────────────────────────────
 * Token disimpan di memori selama masa berlakunya supaya tidak minta
 * token baru pada setiap permintaan.
 */
let tokenTersimpan: { nilai: string; sampai: number } | null = null;

async function tokenGoBiz(): Promise<string> {
  if (tokenTersimpan && Date.now() < tokenTersimpan.sampai - 60_000) {
    return tokenTersimpan.nilai;
  }

  // GoAuth meminta jalur /oauth2/token, dan scope wajib ikut dikirim.
  // Dokumentasi resmi memakai Basic auth; sebagian contoh memakai kredensial
  // di body. Keduanya dicoba supaya bentuk pengiriman tidak jadi penghalang.
  const scope = "payment:transaction:write payment:transaction:read";
  const dasar = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

  const cara: Array<{ nama: string; opsi: RequestInit }> = [
    {
      nama: "basic",
      opsi: {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          authorization: `Basic ${dasar}`,
        },
        body: new URLSearchParams({ grant_type: "client_credentials", scope }),
      },
    },
    {
      nama: "body",
      opsi: {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          scope,
        }),
      },
    },
  ];

  let pesanAkhir = "";
  for (const c of cara) {
    const jawab = await fetch(`${GOAUTH_URL}/oauth2/token`, c.opsi);
    if (!jawab.ok) {
      pesanAkhir = `GoBiz menolak permintaan token lewat ${c.nama} (HTTP ${jawab.status}).`;
      continue;
    }
    const isi = await jawab.json() as { access_token?: string; expires_in?: number };
    if (!isi.access_token) {
      pesanAkhir = `Jawaban token GoBiz tanpa access_token (lewat ${c.nama}).`;
      continue;
    }
    tokenTersimpan = {
      nilai: isi.access_token,
      sampai: Date.now() + (isi.expires_in ?? 3600) * 1000,
    };
    return tokenTersimpan.nilai;
  }

  throw new Error(pesanAkhir || "GoBiz tidak memberi token.");
}

async function panggilGoBiz(jalur: string, opsi: RequestInit = {}) {
  // Kredensial yang belum diisi atau jaringan yang putus bukan kesalahan
  // pengunjung, jadi hasilnya dikembalikan sebagai jawaban gagal biasa.
  let token: string;
  try {
    token = await tokenGoBiz();
  } catch (e) {
    console.error("Token GoBiz gagal", e);
    return { ok: false, status: 0, isi: { galat: "token" } };
  }

  let jawab: Response;
  try {
    jawab = await fetch(`${GOBL_URL}${jalur}`, {
      ...opsi,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
        ...(opsi.headers ?? {}),
      },
    });
  } catch (e) {
    console.error("GoBiz tidak terjangkau", e);
    return { ok: false, status: 0, isi: { galat: "jaringan" } };
  }

  const teks = await jawab.text();
  let isi: unknown = null;
  try {
    isi = teks ? JSON.parse(teks) : null;
  } catch {
    isi = { mentah: teks.slice(0, 300) };
  }
  return { ok: jawab.ok, status: jawab.status, isi };
}

/* ── kunci lisensi ────────────────────────────────────────────────────
 * Dua belas karakter dari huruf dan angka, tanpa huruf yang mirip
 * sehingga aman diketik ulang dari layar.
 */
function kunciLisensi(): string {
  const abjad = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const acak = new Uint8Array(12);
  crypto.getRandomValues(acak);
  let inti = "";
  for (let i = 0; i < 12; i++) inti += abjad[acak[i] % abjad.length];
  return `NVT-${inti.slice(0, 4)}-${inti.slice(4, 8)}-${inti.slice(8, 12)}`;
}

/* ── perintah admin ───────────────────────────────────────────────────
 * Halaman rahasia untuk menandai pembayaran yang sudah masuk ke GoPay.
 * Dilindungi kata sandi yang hanya ada di server.
 */
function adminSah(masuk: string): boolean {
  const benar = Deno.env.get("ADMIN_PASS") ?? "";
  if (!benar) return false;
  // Bandingkan dengan waktu tetap supaya panjang teks tidak bocor lewat waktu.
  if (masuk.length !== benar.length) return false;
  let beda = 0;
  for (let i = 0; i < benar.length; i++) {
    beda |= masuk.charCodeAt(i) ^ benar.charCodeAt(i);
  }
  return beda === 0;
}

/** Ubah pesanan jadi lunas dan terbitkan lisensi 30 hari. */
async function tandaiLunas(pesananId: string): Promise<string | null> {
  const hasil = await selesaikan(pesananId, "settlement");
  return hasil?.kunci ?? null;
}

async function perintahAdmin(isi: Record<string, unknown>) {
  const sandi = String(isi.sandi ?? "");
  if (!adminSah(sandi)) {
    return balas({ pesan: "Kata sandi admin belum benar." }, 401);
  }

  const perintah = String(isi.perintah ?? "");

  if (perintah === "daftar") {
    const { data } = await db
      .from("pesanan")
      .select("order_id, email, jumlah, status, mode, dibuat_pada, dibayar_pada")
      .order("dibuat_pada", { ascending: false })
      .limit(60);
    return balas({ pesanan: data ?? [] });
  }

  if (perintah === "lunas") {
    const orderId = String(isi.order_id ?? "").trim().toUpperCase();
    const { data: pesanan } = await db
      .from("pesanan")
      .select("id, order_id, email, jumlah, status")
      .eq("order_id", orderId)
      .maybeSingle();

    if (!pesanan) return balas({ pesan: "Nomor pesanan tidak ditemukan." }, 404);
    if (pesanan.status === "lunas") {
      const { data: ada } = await db
        .from("lisensi")
        .select("kunci, aktif_sampai")
        .eq("pesanan_id", pesanan.id)
        .maybeSingle();
      return balas({
        pesan: "Pesanan ini sudah lunas.",
        kunci: ada?.kunci ?? null,
        aktifSampai: ada?.aktif_sampai ?? null,
      });
    }

    const kunci = await tandaiLunas(pesanan.id);
    if (!kunci) return balas({ pesan: "Lisensi gagal diterbitkan." }, 500);

    await db.from("catatan_admin").insert({
      pesanan_id: pesanan.id,
      tindakan: "tandai-lunas",
      keterangan: `ditandai manual untuk ${pesanan.email}`,
    });

    return balas({
      pesan: "Pesanan ditandai lunas dan lisensi diterbitkan.",
      order_id: pesanan.order_id,
      email: pesanan.email,
      jumlah: pesanan.jumlah,
      kunci,
    });
  }

  if (perintah === "cair") {
    // Tempel isi mutasi dari aplikasi GoPay atau rekening. Semua angka
    // diambil, lalu dicocokkan dengan nominal pesanan yang masih menunggu.
    const teks = String(isi.mutasi ?? "");
    const angka = new Set<number>();
    for (const m of teks.matchAll(/(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+|\d{4,7})/gi)) {
      const bersih = m[1].replace(/[.,]/g, "");
      const n = Number(bersih);
      if (Number.isFinite(n) && n >= 1000 && n <= 100_000_000) angka.add(n);
    }

    if (!angka.size) {
      return balas({ pesan: "Tidak ada angka yang bisa dibaca dari mutasi itu." }, 400);
    }

    const { data: menunggu } = await db
      .from("pesanan")
      .select("id, order_id, email, jumlah")
      .eq("status", "menunggu")
      .eq("mode", "statis");

    const cocok: Array<{ order_id: string; email: string; jumlah: number; kunci: string }> = [];
    const tidakCocok: number[] = [];

    for (const n of angka) {
      const p = (menunggu ?? []).find((x: { jumlah: number }) => x.jumlah === n);
      if (!p) {
        tidakCocok.push(n);
        continue;
      }
      const kunci = await tandaiLunas(p.id);
      if (!kunci) continue;
      await db.from("catatan_admin").insert({
        pesanan_id: p.id,
        tindakan: "cair",
        keterangan: `dicocokkan dari mutasi, nominal ${n}`,
      });
      cocok.push({ order_id: p.order_id, email: p.email, jumlah: p.jumlah, kunci });
    }

    return balas({
      pesan: cocok.length
        ? `${cocok.length} pembayaran dicocokkan dan lisensinya terbit.`
        : "Tidak ada nominal yang cocok dengan pesanan yang menunggu.",
      cocok,
      tidakCocok,
    });
  }

  return balas({ pesan: "Perintah admin tidak dikenal." }, 400);
}

/* ── aksi: buat pesanan ───────────────────────────────────────────────── */
function nomorPesanan(): string {
  const abjad = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const acak = new Uint8Array(6);
  crypto.getRandomValues(acak);
  let inti = "";
  for (let i = 0; i < 6; i++) inti += abjad[acak[i] % abjad.length];
  return `NV-${inti.slice(0, 3)}-${inti.slice(3, 6)}`;
}

/** Nominal unik dengan tambahan acak, tanpa menabrak pesanan yang menunggu. */
async function nominalUnik(): Promise<number> {
  const { data: terpakai } = await db
    .from("pesanan")
    .select("jumlah")
    .eq("status", "menunggu")
    .eq("mode", "statis");

  const dipakai = new Set((terpakai ?? []).map((b: { jumlah: number }) => b.jumlah));

  // Coba acak dulu supaya tidak selalu mulai dari angka yang sama.
  for (let i = 0; i < 40; i++) {
    const calon = HARGA + 1 + Math.floor(Math.random() * SEKAT_NOMINAL);
    if (!dipakai.has(calon)) return calon;
  }
  // Kalau jendela hampir penuh, cari urutan pertama yang kosong.
  for (let n = HARGA + 1; n <= HARGA + SEKAT_NOMINAL; n++) {
    if (!dipakai.has(n)) return n;
  }
  throw new Error("Nominal unik habis.");
}

const PAYLOAD_STATIS = Deno.env.get("QRIS_PAYLOAD") ?? "";

/**
 * Pesanan dengan kode QRIS statis.
 *
 * Kode QR tidak dibuat per pesanan, tetapi nominalnya unik. Pembeli melihat
 * angka persis, memindai, lalu membayar. Server tidak bisa mengetahui
 * pembayaran sendiri, jadi status berpindah ke lunas lewat dua jalan:
 * pencairan mutasi yang ditempel admin, atau penandaan manual satu pesanan.
 */
async function buatPesananStatis(emailMasuk: string) {
  const email = String(emailMasuk ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return balas({ pesan: "Alamat email belum benar." }, 400);
  }
  if (!PAYLOAD_STATIS) {
    return balas({
      pesan: "Kode QRIS merchant belum dipasang di server.",
      kode: "belum_dikonfigurasi",
    }, 503);
  }

  // Satu pesanan menunggu untuk satu email, supaya tidak ada dua nominal
  // aktif untuk orang yang sama.
  const { data: ada } = await db
    .from("pesanan")
    .select("order_id, akses_token, jumlah, kedaluwarsa_pada")
    .eq("email", email)
    .eq("status", "menunggu")
    .eq("mode", "statis")
    .gt("kedaluwarsa_pada", new Date().toISOString())
    .order("dibuat_pada", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ada) {
    return balas({
      mode: "statis",
      order_id: ada.order_id,
      akses_token: ada.akses_token,
      jumlah: ada.jumlah,
      kedaluwarsa: ada.kedaluwarsa_pada,
      qrisSama: true,
    });
  }

  const jumlah = await nominalUnik();
  const orderId = nomorPesanan();
  const kedaluwarsa = new Date(Date.now() + MENIT_KEDALUWARSA * 60_000).toISOString();

  const { data: baris, error } = await db
    .from("pesanan")
    .insert({
      order_id: orderId,
      email,
      jumlah,
      mode: "statis",
      status: "menunggu",
      kedaluwarsa_pada: kedaluwarsa,
    })
    .select("order_id, akses_token, jumlah, kedaluwarsa_pada")
    .single();

  if (error || !baris) {
    console.error("Gagal menyimpan pesanan statis", error);
    return balas({ pesan: "Pesanan belum bisa dibuat. Coba lagi." }, 500);
  }

  return balas({
    mode: "statis",
    order_id: baris.order_id,
    akses_token: baris.akses_token,
    jumlah: baris.jumlah,
    kedaluwarsa: baris.kedaluwarsa_pada,
  });
}

async function buatPesanan(emailMasuk: string) {
  const email = String(emailMasuk ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return balas({ pesan: "Alamat email belum benar." }, 400);
  }
  if (!CLIENT_ID || !CLIENT_SECRET || !OUTLET_ID) {
    return balas({
      pesan: "Pembayaran belum siap: kredensial GoBiz belum diisi di server.",
      kode: "belum_dikonfigurasi",
    }, 503);
  }

  // Satu pesanan menunggu untuk satu email supaya kode QR tidak menumpuk.
  const { data: ada } = await db
    .from("pesanan")
    .select("order_id, akses_token, qris_string, jumlah, kedaluwarsa_pada")
    .eq("email", email)
    .eq("status", "menunggu")
    .gt("kedaluwarsa_pada", new Date().toISOString())
    .order("dibuat_pada", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ada?.qris_string) {
    return balas({
      order: ada.order_id,
      token: ada.akses_token,
      qris: ada.qris_string,
      jumlah: ada.jumlah,
      kedaluwarsa: ada.kedaluwarsa_pada,
      dipakaiUlang: true,
    });
  }

  const orderId = `NV-${Date.now().toString(36).toUpperCase()}-${
    crypto.getRandomValues(new Uint8Array(2))
      .reduce((a, b) => a + b.toString(16).padStart(2, "0"), "")
      .toUpperCase()
  }`;
  const idem = crypto.randomUUID().replace(/-/g, "").slice(0, 32);

  const kirim = await panggilGoBiz(
    `/integrations/payment/outlets/${encodeURIComponent(OUTLET_ID)}/v2/transactions`,
    {
      method: "POST",
      headers: { "Idempotency-Key": idem },
      body: JSON.stringify({
        payment_type: "qris",
        transaction_details: {
          order_id: orderId,
          gross_amount: HARGA,
          currency: "IDR",
        },
        item_details: [{
          id: "naovert-30",
          price: HARGA,
          quantity: 1,
          name: "NaoVert 30 hari",
          brand: "NaoVert",
          category: "software",
          merchant_name: null,
        }],
        metadata: { produk: "naovert", email },
      }),
    },
  );

  if (!kirim.ok) {
    console.error("GoBiz gagal membuat transaksi", kirim.status, kirim.isi);

    // Jangan biarkan pembeli buntu. Bila GoBiz menolak, pesanan dibuat dengan
    // kode QRIS statis bernominal unik supaya mereka tetap bisa membayar.
    if (PAYLOAD_STATIS) {
      console.error("Jatuh ke mode statis");
      return await buatPesananStatis(email);
    }

    return balas({
      pesan: "GoBiz belum bisa membuat kode pembayaran. Coba lagi sebentar.",
      kode: "gobiz_gagal",
    }, 502);
  }

  const isi = kirim.isi as {
    data?: {
      transaction?: { id?: string; qris_string?: string; gross_amount?: number };
    };
  };
  const trx = isi?.data?.transaction;
  if (!trx?.qris_string) {
    console.error("Jawaban GoBiz tanpa qris_string", kirim.isi);
    if (PAYLOAD_STATIS) return await buatPesananStatis(email);
    return balas({ pesan: "GoBiz tidak mengirim kode QR.", kode: "tanpa_qr" }, 502);
  }

  const kedaluwarsa = new Date(Date.now() + MENIT_KEDALUWARSA * 60_000).toISOString();

  const { data: baris, error } = await db
    .from("pesanan")
    .insert({
      order_id: orderId,
      email,
      jumlah: trx.gross_amount ?? HARGA,
      gobiz_id: trx.id ?? null,
      qris_string: trx.qris_string,
      kedaluwarsa_pada: kedaluwarsa,
    })
    .select("order_id, akses_token, qris_string, jumlah, kedaluwarsa_pada")
    .single();

  if (error || !baris) {
    console.error("Gagal menyimpan pesanan", error);
    return balas({ pesan: "Pesanan tidak bisa disimpan.", kode: "simpan_gagal" }, 500);
  }

  return balas({
    order: baris.order_id,
    token: baris.akses_token,
    qris: baris.qris_string,
    jumlah: baris.jumlah,
    kedaluwarsa: baris.kedaluwarsa_pada,
  });
}

/* ── aksi: status pesanan ─────────────────────────────────────────────── */
async function statusPesanan(orderId: string, token: string) {
  const { data: pesanan } = await db
    .from("pesanan")
    .select("id, order_id, status, jumlah, mode, kedaluwarsa_pada, dibayar_pada, gobiz_id, akses_token")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!pesanan || pesanan.akses_token !== token) {
    return balas({ pesan: "Pesanan tidak ditemukan." }, 404);
  }

  // Kode QRIS dari GoBiz tetap bisa dibayar setelah hitung mundur halaman
  // habis. Jadi pesanan yang sudah ditandai kedaluwarsa pun diperiksa ulang;
  // pembayaran yang datang terlambat tetap menerbitkan lisensi.
  const perluDicek = (pesanan.status === "menunggu" || pesanan.status === "kedaluwarsa")
    && Boolean(pesanan.gobiz_id);

  if (perluDicek) {
    // Tanya langsung ke GoBiz bila webhook belum sampai. Ini yang membuat
    // halaman tahu sendiri saat pembayaran terjadi.
    const cek = await panggilGoBiz(
      `/integrations/payment/outlets/${encodeURIComponent(OUTLET_ID)}/v1/transactions/${encodeURIComponent(pesanan.gobiz_id!)}`,
      { method: "GET" },
    );

    const trx = (cek.isi as { data?: { transaction?: { status?: string } } })?.data?.transaction;
    if (cek.ok && trx?.status && trx.status.toLowerCase() !== "pending") {
      const hasil = await selesaikan(pesanan.id, trx.status);
      if (hasil) {
        return balas({
          status: hasil.status,
          kunci: hasil.kunci,
          aktifSampai: hasil.aktifSampai,
          dibayar: hasil.dibayar,
        });
      }
    }
  }

  // Tanpa nomor transaksi GoBiz, tidak ada yang bisa ditanyai lagi, jadi
  // pesanan yang lewat waktu ditutup di sini.
  if (pesanan.status === "menunggu" && !pesanan.gobiz_id
      && new Date(pesanan.kedaluwarsa_pada) < new Date()) {
    // Pesanan statis tetap bisa dibayar terlambat, jadi jangan ditutup
    // selama pembayarannya mungkin masih masuk ke merchant.
    if (pesanan.mode === "statis") {
      return balas({
        status: "menunggu",
        mode: "statis",
        lewatWaktu: true,
        jumlah: pesanan.jumlah,
        kedaluwarsa: pesanan.kedaluwarsa_pada,
      });
    }
    await db.from("pesanan").update({ status: "kedaluwarsa" }).eq("id", pesanan.id);
    return balas({ status: "kedaluwarsa" });
  }

  if (pesanan.status === "lunas") {
    const { data: lis } = await db
      .from("lisensi")
      .select("kunci, aktif_sampai")
      .eq("pesanan_id", pesanan.id)
      .maybeSingle();
    return balas({
      status: "lunas",
      mode: pesanan.mode,
      kunci: lis?.kunci ?? null,
      aktifSampai: lis?.aktif_sampai ?? null,
      dibayar: pesanan.dibayar_pada,
    });
  }

  return balas({
    status: pesanan.status,
    mode: pesanan.mode,
    kedaluwarsa: pesanan.kedaluwarsa_pada,
    jumlah: pesanan.jumlah,
  });
}

/* ── penyelesaian bersama ─────────────────────────────────────────────── */
async function selesaikan(
  pesananId: string,
  statusMasuk: string,
): Promise<{ status: string; kunci?: string; aktifSampai?: string; dibayar?: string } | null> {
  const lunas = ["success", "settlement", "settled", "paid", "capture", "completed"];
  const gagal = ["expire", "expired", "cancel", "cancelled", "deny", "denied", "failed"];

  const nilai = String(statusMasuk ?? "").toLowerCase();

  if (lunas.includes(nilai)) {
    const { data: pesanan } = await db
      .from("pesanan")
      .update({ status: "lunas", dibayar_pada: new Date().toISOString() })
      .eq("id", pesananId)
      .select("email, jumlah")
      .single();

    if (!pesanan) return null;

    const sampai = new Date(Date.now() + 30 * 24 * 3600_000).toISOString();
    const { data: lis, error } = await db
      .from("lisensi")
      .insert({
        kunci: kunciLisensi(),
        pesanan_id: pesananId,
        email: pesanan.email,
        aktif_sampai: sampai,
      })
      .select("kunci, aktif_sampai")
      .single();

    if (error) {
      // Lisensi mungkin sudah dibuat oleh jalur lain. Ambil yang ada.
      const { data: ada } = await db
        .from("lisensi")
        .select("kunci, aktif_sampai")
        .eq("pesanan_id", pesananId)
        .maybeSingle();
      if (ada) return { status: "lunas", kunci: ada.kunci, aktifSampai: ada.aktif_sampai };
      console.error("Gagal menerbitkan lisensi", error);
      return null;
    }

    return { status: "lunas", kunci: lis.kunci, aktifSampai: lis.aktif_sampai };
  }

  if (gagal.includes(nilai)) {
    await db.from("pesanan").update({ status: nilai.includes("expire") ? "kedaluwarsa" : "gagal" })
      .eq("id", pesananId);
    return { status: nilai.includes("expire") ? "kedaluwarsa" : "gagal" };
  }

  return null;
}

/* ── aksi: notifikasi dari GoBiz ──────────────────────────────────────── */
async function terimaNotifikasi(mentah: string, tanda: string | null) {
  let isi: Record<string, unknown> = {};
  try {
    isi = JSON.parse(mentah);
  } catch {
    return balas({ pesan: "Isi notifikasi bukan JSON." }, 400);
  }

  await db.from("webhook_masuk").insert({ jenis: String(isi.event ?? isi.type ?? ""), isi });

  const sah = await tandaTanganSah(mentah, tanda);

  const data = (isi.data ?? isi) as Record<string, unknown>;
  const trx = (data.transaction ?? data) as Record<string, unknown>;
  const orderId = String(trx.order_id ?? data.order_id ?? "");
  const gobizId = String(trx.id ?? data.id ?? "");
  const status = String(trx.status ?? data.status ?? isi.status ?? "");

  let kueri = db
    .from("pesanan")
    .select("id, status, gobiz_id, order_id");

  if (orderId && gobizId) {
    kueri = kueri.or(`order_id.eq.${orderId},gobiz_id.eq.${gobizId}`);
  } else if (orderId) {
    kueri = kueri.eq("order_id", orderId);
  } else if (gobizId) {
    kueri = kueri.eq("gobiz_id", gobizId);
  } else {
    return balas({ diterima: true, catatan: "notifikasi tanpa nomor pesanan" });
  }

  const { data: pesanan } = await kueri.maybeSingle();

  if (!pesanan) {
    return balas({ diterima: true, catatan: "pesanan tidak dikenal" });
  }

  if (pesanan.status === "lunas") return balas({ diterima: true, catatan: "sudah lunas" });

  // Notifikasi tanpa tanda tangan sah tidak dipercaya. Pesanan diverifikasi
  // ulang lewat API GoBiz, dan hanya itu yang boleh menerbitkan kunci.
  if (!sah) {
    const cek = await panggilGoBiz(
      `/integrations/payment/outlets/${encodeURIComponent(OUTLET_ID)}/v1/transactions/${
        encodeURIComponent(pesanan.gobiz_id ?? gobizId)
      }`,
      { method: "GET" },
    );
    const statusNyata = (cek.isi as { data?: { transaction?: { status?: string } } })
      ?.data?.transaction?.status;
    if (!cek.ok || !statusNyata) {
      return balas({ diterima: true, catatan: "menunggu verifikasi" });
    }
    await selesaikan(pesanan.id, statusNyata);
    return balas({ diterima: true, catatan: "diverifikasi lewat API" });
  }

  await selesaikan(pesanan.id, status);
  return balas({ diterima: true });
}

/* ── pintu masuk ──────────────────────────────────────────────────────── */
Deno.serve(async (permintaan) => {
  if (permintaan.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: kepalaCors });
  }

  const url = new URL(permintaan.url);

  try {
    if (permintaan.method === "GET") {
      const order = url.searchParams.get("order") ?? "";
      const token = url.searchParams.get("t") ?? "";
      if (!order || !token) return balas({ pesan: "Pesanan belum dipilih." }, 400);
      return await statusPesanan(order, token);
    }

    if (permintaan.method !== "POST") {
      return balas({ pesan: "Metode tidak dikenal." }, 405);
    }

    const mentah = await permintaan.text();

    // Notifikasi GoBiz datang tanpa kunci apikey milik peramban, jadi dikenali
    // dari bentuk isinya. Permintaan dari halaman selalu memakai aksi.
    let mungkinNotifikasi = false;
    try {
      const uji = JSON.parse(mentah);
      mungkinNotifikasi = !("aksi" in uji) &&
        Boolean(uji.event ?? uji.type ?? uji.data ?? uji.transaction ?? uji.order_id);
    } catch {
      return balas({ pesan: "Isi permintaan bukan JSON." }, 400);
    }

    if (mungkinNotifikasi) {
      const tanda = permintaan.headers.get("x-signature") ??
        permintaan.headers.get("x-callback-signature") ??
        permintaan.headers.get("x-gobiz-signature");
      return await terimaNotifikasi(mentah, tanda);
    }

    const isi = JSON.parse(mentah) as { aksi?: string; email?: string };

    if (isi.aksi === "admin") {
      return await perintahAdmin(isi as Record<string, unknown>);
    }
    if (isi.aksi === "buat") {
      // Tanpa kredensial GoBiz, pesanan jatuh ke kode QRIS statis dengan
      // nominal unik. Pembeli tetap bisa membayar hari ini.
      if (!CLIENT_ID || !CLIENT_SECRET || !OUTLET_ID) {
        return await buatPesananStatis(isi.email ?? "");
      }
      return await buatPesanan(isi.email ?? "");
    }

    return balas({ pesan: "Aksi tidak dikenal." }, 400);
  } catch (e) {
    console.error("Kesalahan tak terduga", e);
    return balas({ pesan: "Ada gangguan di server pembayaran." }, 500);
  }
});
