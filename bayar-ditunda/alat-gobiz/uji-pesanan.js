/**
 * uji-pesanan.js
 *
 * Menembak Edge Function bayar yang sudah hidup di Supabase, memakai
 * kredensial GoBiz yang sudah dipasang. Skrip ini yang membuktikan alur
 * ujung ke ujung tanpa harus membuka peramban.
 *
 *   node alat/gobiz/uji-pesanan.js                    buat pesanan lalu pantau 3 menit
 *   node alat/gobiz/uji-pesanan.js --email=aku@mail.id
 *   node alat/gobiz/uji-pesanan.js --pantau=600       pantau 10 menit
 */

const FUNGSI = "https://zxoszpvrzgcsobivlgaq.supabase.co/functions/v1/bayar";

const arg = (nama, bawaan) => {
  const a = process.argv.find((x) => x.startsWith(`--${nama}=`));
  return a ? a.split("=").slice(1).join("=") : bawaan;
};

const EMAIL = arg("email", `uji${Date.now()}@contoh.id`);
const PANTAU = Number(arg("pantau", 180));

async function kirim(badan) {
  const jawab = await fetch(FUNGSI, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(badan),
  });
  const teks = await jawab.text();
  let isi;
  try {
    isi = JSON.parse(teks);
  } catch {
    isi = { mentah: teks };
  }
  return { kode: jawab.status, isi };
}

console.log("── Membuat pesanan ─────────────────────────────────");
console.log(`  email: ${EMAIL}`);
const buat = await kirim({ aksi: "buat", email: EMAIL });
console.log(`  HTTP ${buat.kode}`);
console.log("  " + JSON.stringify(buat.isi).slice(0, 500));

if (buat.kode !== 200) {
  console.error(`
Gagal membuat pesanan. Bila kodenya belum_dikonfigurasi, kredensial
GoBiz belum terpasang di server. Jalankan lebih dulu:

  node alat/gobiz/pasang-rahasia.js
`);
  process.exit(1);
}

const kodePesanan = buat.isi.order_id || buat.isi.kode_pesanan || buat.isi.id;
const token = buat.isi.akses_token || buat.isi.token;
const qris = buat.isi.qris_string || buat.isi.qris;

if (qris) {
  console.log(`
── Kode QRIS dinamis ───────────────────────────────
  ${qris.length} karakter
  Awal : ${qris.slice(0, 60)}…
  Akhir: …${qris.slice(-40)}

  Buka aplikasi GoPay atau bank apa pun, pindai kode di halaman
  beli.html (bukan string di atas), lalu bayar Rp15.000.
`);
}

if (!kodePesanan || !token) {
  console.error("  Jawaban tidak memuat kode pesanan atau token. Tidak bisa memantau.");
  process.exit(1);
}

console.log(`── Memantau status selama ${PANTAU} detik ───────────────`);
const mulai = Date.now();
let terakhir = "";
while ((Date.now() - mulai) / 1000 < PANTAU) {
  await new Promise((r) => setTimeout(r, 5000));
  const s = await kirim({ aksi: "status", order_id: kodePesanan, akses_token: token });
  const st = s.isi.status || s.isi.keadaan || `HTTP ${s.kode}`;
  if (st !== terakhir) {
    const detik = Math.round((Date.now() - mulai) / 1000);
    console.log(`  [${String(detik).padStart(3)}s] ${st}`);
    terakhir = st;
  }
  if (String(st).includes("lunas")) {
    console.log(`
SELESAI. Pembayaran terdeteksi otomatis.
  kunci lisensi: ${s.isi.kunci || s.isi.kunci_lisensi || "(lihat jawaban penuh)"}
`);
    console.log("  " + JSON.stringify(s.isi).slice(0, 400));
    process.exit(0);
  }
}

console.log(`
Waktu pantau habis, status terakhir: ${terakhir}
Kode QRIS GoBiz masih bisa dibayar setelah ini. Jalankan ulang dengan
kode pesanan yang sama untuk melanjutkan pemantauan:
`);
console.log(`  node alat/gobiz/uji-pesanan.js --pantau=300`);
