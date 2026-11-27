/**
 * Memastikan ACUAN-DESAIN.md tidak berubah.
 *
 * Aturan yang tertulis di berkas itu adalah perintah pemilik proyek
 * ("jangan ubah acuan ini"). Skrip ini dipakai sebelum commit: kalau keluar
 *nya bukan 0, berarti acuan tersentuh dan pekerjaan harus berhenti sampai
 * pemilik mengonfirmasi.
 *
 * Sidik disimpan di sini, bukan di berkas terpisah, supaya keduanya ikut
 * teruj i bersama repositori.
 */
const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const SIDIK = "0fbbe35e75216490a89130bc36bbc20f20904ff9a2da7ec7305aa89b41ba9230";

const berkas = join(__dirname, "..", "ACUAN-DESAIN.md");
const isi = readFileSync(berkas, "utf8").replace(/\r\n/g, "\n");
const sidik = createHash("sha256").update(isi, "utf8").digest("hex");

if (sidik === SIDIK) {
  console.log("ACUAN-DESAIN.md utuh (" + sidik.slice(0, 12) + ")");
  process.exit(0);
}
console.error("ACUAN-DESAIN.md BERUBAH!");
console.error("  disimpan: " + SIDIK);
console.error("  sekarang: " + sidik);
process.exit(1);
