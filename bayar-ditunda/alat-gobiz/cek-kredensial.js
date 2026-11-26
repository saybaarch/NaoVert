/**
 * cek-kredensial.js
 *
 * Menembak API GoBiz yang sebenarnya dengan kredensial dari gobiz.txt.
 * Berhenti di langkah pertama yang gagal, supaya jelas bagian mana yang salah.
 *
 * Berkas ini tidak pernah menampilkan nilai rahasia. Yang dicetak hanya
 * panjangnya dan nama variabel, jadi aman ditempel ke layar atau obrolan.
 *
 *   node alat/gobiz/cek-kredensial.js
 *   node alat/gobiz/cek-kredensial.js --nominal=100
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const AKAR = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const BERKAS = join(AKAR, "gobiz.txt");

const NOMINAL = Number(
  (process.argv.find((a) => a.startsWith("--nominal=")) || "").split("=")[1] || 100,
);

function baca() {
  let isi;
  try {
    isi = readFileSync(BERKAS, "utf8");
  } catch {
    mati(`Berkas ${BERKAS} belum ada. Salin dari contoh lalu isi nilainya.`);
  }
  const nilai = {};
  for (const baris of isi.split(/\r?\n/)) {
    const bersih = baris.trim();
    if (!bersih || bersih.startsWith("#")) continue;
    const pisah = bersih.indexOf("=");
    if (pisah < 0) continue;
    const kunci = bersih.slice(0, pisah).trim();
    const isinya = bersih.slice(pisah + 1).trim().replace(/^["']|["']$/g, "");
    if (isinya) nilai[kunci] = isinya;
  }
  return nilai;
}

function mati(pesan) {
  console.error(`\nBERHENTI: ${pesan}`);
  process.exit(1);
}

function tanda(nama, nilai) {
  if (!nilai) return `${nama.padEnd(20)} (kosong)`;
  return `${nama.padEnd(20)} terisi, ${nilai.length} karakter`;
}

const n = baca();

console.log("── Kredensial terbaca ──────────────────────────────");
for (const k of ["GOBIZ_CLIENT_ID", "GOBIZ_CLIENT_SECRET", "GOBIZ_OUTLET_ID"]) {
  console.log("  " + tanda(k, n[k]));
}
console.log("  " + `GOBIZ_BASE_URL`.padEnd(20) + (n.GOBIZ_BASE_URL || "https://api.gobiz.co.id"));
console.log("  " + `GOBIZ_OAUTH_URL`.padEnd(20) + (n.GOBIZ_OAUTH_URL || "https://accounts.go-jek.com"));

const kurang = ["GOBIZ_CLIENT_ID", "GOBIZ_CLIENT_SECRET"].filter((k) => !n[k]);
if (kurang.length) {
  mati(`Masih kosong: ${kurang.join(", ")}. Nomor GoPay atau NMID QRIS tidak bisa menggantikan nilai ini.`);
}
if (!n.GOBIZ_OUTLET_ID) {
  console.log("\n  GOBIZ_OUTLET_ID kosong. Akan dicari otomatis setelah token diterima.");
}

const OAUTH = (n.GOBIZ_OAUTH_URL || "https://accounts.go-jek.com").replace(/\/$/, "");
const API = (n.GOBIZ_BASE_URL || "https://api.gobiz.co.id").replace(/\/$/, "");

async function ambilToken() {
  console.log("\n[1] Meminta token ke GoAuth");
  console.log(`    ${OAUTH}/oauth2/token`);

  const scope = "payment:transaction:write payment:transaction:read";

  // Dokumentasi resmi memakai Basic auth, sedangkan sebagian contoh memakai
  // kredensial di body. Keduanya dicoba supaya tidak gagal hanya karena beda
  // cara kirim.
  const cara = [
    {
      nama: "Basic auth",
      opsi: {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          authorization:
            "Basic " +
            Buffer.from(`${n.GOBIZ_CLIENT_ID}:${n.GOBIZ_CLIENT_SECRET}`).toString("base64"),
        },
        body: new URLSearchParams({ grant_type: "client_credentials", scope }),
      },
    },
    {
      nama: "kredensial di body",
      opsi: {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: n.GOBIZ_CLIENT_ID,
          client_secret: n.GOBIZ_CLIENT_SECRET,
          scope,
        }),
      },
    },
  ];

  let jawabanTerakhir = "";
  for (const c of cara) {
    const jawab = await fetch(`${OAUTH}/oauth2/token`, c.opsi);
    const teks = await jawab.text();
    if (jawab.ok) {
      let isi;
      try {
        isi = JSON.parse(teks);
      } catch {
        mati(`Jawaban GoAuth bukan JSON: ${teks.slice(0, 160)}`);
      }
      if (!isi.access_token) mati(`Tidak ada access_token: ${teks.slice(0, 160)}`);
      console.log(`    Diterima lewat ${c.nama}.`);
      console.log(`    Token ${isi.access_token.length} karakter, berlaku ${isi.expires_in ?? "?"} detik.`);
      return isi.access_token;
    }
    jawabanTerakhir = `HTTP ${jawab.status} ${teks.slice(0, 220)}`;
    console.log(`    ${c.nama}: ditolak (${jawab.status})`);
  }

  mati(
    `GoAuth menolak kedua cara. Jawaban terakhir: ${jawabanTerakhir}\n` +
      `  401 invalid_client berarti client_id atau client_secret salah, ATAU\n` +
      `  kredensial itu milik lingkungan lain (sandbox vs produksi).\n` +
      `  400 invalid_scope berarti aplikasimu belum diberi izin payment.\n` +
      `  Alamat yang dipakai: ${OAUTH}`,
  );
}

async function cariOutlet(token) {
  console.log("\n[2] Mencari outlet yang terhubung dengan aplikasimu");
  const jalur = `${API}/integrations/partner/v1/token-info`;
  const jawab = await fetch(jalur, { headers: { authorization: `Bearer ${token}` } });
  const teks = await jawab.text();
  console.log(`    HTTP ${jawab.status} ${teks.slice(0, 400)}`);
  if (!jawab.ok) return null;

  let isi;
  try {
    isi = JSON.parse(teks);
  } catch {
    return null;
  }

  // Bentuk jawaban bisa berbeda antar versi: cari semua id yang mirip outlet.
  const kandidat = [];
  const sisir = (x) => {
    if (!x || typeof x !== "object") return;
    if (Array.isArray(x)) return x.forEach(sisir);
    if (typeof x.id === "string" && /^G\d{6,}$/i.test(x.id)) kandidat.push(x);
    else if (typeof x.outlet_id === "string") kandidat.push({ id: x.outlet_id, ...x });
    Object.values(x).forEach(sisir);
  };
  sisir(isi);

  if (!kandidat.length) {
    console.log("    Tidak ada outlet ditemukan di jawaban ini.");
    return null;
  }
  console.log("\n    Outlet ditemukan:");
  for (const o of kandidat) {
    console.log(`      id=${o.id}  ${o.name || o.outlet_name || o.merchant_name || ""}`);
  }
  console.log(`\n    Salin salah satu id ke gobiz.txt bagian GOBIZ_OUTLET_ID.`);
  return kandidat[0].id;
}

async function buatTransaksi(token) {
  const outlet = n.GOBIZ_OUTLET_ID || (await cariOutlet(token));
  if (!outlet) {
    mati("GOBIZ_OUTLET_ID belum ada dan tidak bisa ditemukan otomatis. Isi manual dari portal developer.");
  }
  console.log(`\n[3] Membuat transaksi QRIS di outlet ${outlet}`);
  const kunci = crypto.randomUUID().replace(/-/g, "");
  const orderId = `VERIF-${Date.now()}`;
  const badan = {
    payment_type: "qris",
    transaction_details: {
      order_id: orderId,
      gross_amount: NOMINAL,
      currency: "IDR",
    },
    item_details: [
      {
        id: "verifikasi",
        price: NOMINAL,
        quantity: 1,
        name: "Verifikasi NaoVert",
        brand: "NaoVert",
        category: "software",
        merchant_name: null,
      },
    ],
  };
  const jalur = `${API}/integrations/payment/outlets/${encodeURIComponent(outlet)}/v2/transactions`;
  console.log(`    POST ${jalur}`);
  const jawab = await fetch(jalur, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "idempotency-key": kunci,
    },
    body: JSON.stringify(badan),
  });
  const teks = await jawab.text();
  if (!jawab.ok) {
    mati(
      `GoBiz menolak transaksi (HTTP ${jawab.status}). Jawaban: ${teks.slice(0, 300)}\n` +
        `  401 berarti token tidak diterima. 403 berarti outlet tidak cocok dengan aplikasi.\n` +
        `  422 biasanya berarti bentuk badan permintaan meleset dari dokumentasi.`,
    );
  }
  let isi;
  try {
    isi = JSON.parse(teks);
  } catch {
    mati(`Jawaban transaksi bukan JSON: ${teks.slice(0, 200)}`);
  }
  const trx = isi.transaction || isi.data?.transaction || isi.data || isi;
  const id = trx.id || trx.transaction_id;
  const qris = trx.qris_string || trx.qr_string || isi.qris_string;
  console.log(`    Transaksi dibuat. id=${id ?? "(tidak ada)"}`);
  console.log(`    qris_string ${qris ? `${qris.length} karakter` : "TIDAK ADA"}`);
  if (qris) {
    console.log(`    Awal: ${qris.slice(0, 40)}…`);
    console.log(`    Akhir: …${qris.slice(-24)}`);
  }
  if (!id || !qris) {
    console.log("\n    Bentuk jawaban berbeda dari dugaan. Kunci yang ada:");
    console.log("    " + Object.keys(isi).join(", "));
    console.log("    " + JSON.stringify(isi).slice(0, 600));
  }
  return { id, qris, outlet };
}

async function cekStatus(token, id, outlet) {
  console.log("\n[4] Memeriksa status transaksi");
  const jalur = `${API}/integrations/payment/outlets/${encodeURIComponent(outlet)}/v1/transactions/${encodeURIComponent(id)}`;
  const jawab = await fetch(jalur, { headers: { authorization: `Bearer ${token}` } });
  const teks = await jawab.text();
  console.log(`    HTTP ${jawab.status} ${teks.slice(0, 300)}`);
  if (jawab.ok) {
    try {
      const isi = JSON.parse(teks);
      console.log(`    status=${isi.status ?? isi.data?.status ?? "(tidak ada)"}`);
    } catch {
      /* biarkan, sudah dicetak mentah */
    }
  }
}

const token = await ambilToken();
const { id, outlet } = await buatTransaksi(token);
if (id) await cekStatus(token, id, outlet);

console.log(`
────────────────────────────────────────────────────
Kalau ketiga langkah di atas lolos, kredensialmu sah dan
fitur QRIS dinamis siap dipakai. Langkah berikutnya:

  node alat/gobiz/pasang-rahasia.js

Setelah itu pesanan uji dari halaman beli.html akan
membuat transaksi sungguhan di outlet GoPay-mu.
`);
