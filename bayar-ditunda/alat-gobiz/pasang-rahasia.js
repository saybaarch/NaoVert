/**
 * pasang-rahasia.js
 *
 * Memasang kredensial GoBiz dari gobiz.txt ke Supabase sebagai Edge Function
 * secrets. Nilai tidak pernah dicetak; hanya nama dan panjangnya.
 *
 *   node alat/gobiz/pasang-rahasia.js
 *
 * Butuh Supabase Personal Access Token. Dibaca dari "github & supabase token.txt"
 * atau dari variabel lingkungan SUPABASE_ACCESS_TOKEN.
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const AKAR = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PROYEK = "zxoszpvrzgcsobivlgaq";

function bacaPasangan(berkas) {
  const nilai = {};
  if (!existsSync(berkas)) return nilai;
  for (const baris of readFileSync(berkas, "utf8").split(/\r?\n/)) {
    const bersih = baris.trim();
    if (!bersih || bersih.startsWith("#")) continue;
    const p = bersih.indexOf("=");
    if (p < 0) continue;
    const k = bersih.slice(0, p).trim();
    const v = bersih.slice(p + 1).trim().replace(/^["']|["']$/g, "");
    if (v) nilai[k] = v;
  }
  return nilai;
}

function mati(p) {
  console.error(`\nBERHENTI: ${p}`);
  process.exit(1);
}

const gobiz = bacaPasangan(join(AKAR, "gobiz.txt"));
const wajib = ["GOBIZ_CLIENT_ID", "GOBIZ_CLIENT_SECRET", "GOBIZ_OUTLET_ID"];
const kurang = wajib.filter((k) => !gobiz[k]);
if (kurang.length) mati(`gobiz.txt belum lengkap. Kosong: ${kurang.join(", ")}`);

let pat = process.env.SUPABASE_ACCESS_TOKEN || "";
if (!pat) {
  const t = join(AKAR, "github & supabase token.txt");
  if (existsSync(t)) {
    const isi = readFileSync(t, "utf8");
    const m = isi.match(/sbp_[A-Za-z0-9_]+/);
    if (m) pat = m[0];
  }
}
if (!pat) mati('Supabase token tidak ditemukan. Isi "github & supabase token.txt" atau set SUPABASE_ACCESS_TOKEN.');

const daftar = wajib.map((k) => ({ name: k, value: gobiz[k] }));
for (const k of ["GOBIZ_BASE_URL", "GOBIZ_OAUTH_URL"]) {
  if (gobiz[k]) daftar.push({ name: k, value: gobiz[k] });
}

console.log("Akan dipasang:");
for (const d of daftar) console.log(`  ${d.name.padEnd(20)} ${d.value.length} karakter`);

const jawab = await fetch(`https://api.supabase.com/v1/projects/${PROYEK}/secrets`, {
  method: "POST",
  headers: {
    authorization: `Bearer ${pat}`,
    "content-type": "application/json",
  },
  body: JSON.stringify(daftar),
});
const teks = await jawab.text();
if (!jawab.ok) mati(`Supabase menolak (HTTP ${jawab.status}): ${teks.slice(0, 300)}`);

console.log("\nTerpasang. Sekarang uji dari halaman:");
console.log("  http://127.0.0.1:8899/beli.html");
console.log("\nAtau lewat server langsung:");
console.log("  node alat/gobiz/uji-pesanan.js");
