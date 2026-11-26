/**
 * Cari kode mati: ekspor yang tidak pernah dipakai, dan komponen yatim.
 *
 * Membaca seluruh berkas TypeScript di app, components, lib, dan hooks, lalu
 * memeriksa setiap nama yang diekspor. Kalau sebuah nama tidak muncul di
 * berkas lain mana pun, kemungkinan besar itu sisa yang bisa dibuang.
 *
 *   node alat/uji/cari-mati.js
 */
const fs = require('fs');
const path = require('path');

const AKAR = path.resolve(__dirname, '..', '..');
const KUNJUNGI = ['app', 'components', 'lib', 'hooks'];

function berkas(dir, keluar = []) {
  for (const n of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, n.name);
    if (n.isDirectory()) berkas(p, keluar);
    else if (/\.(ts|tsx)$/.test(n.name)) keluar.push(p);
  }
  return keluar;
}

const semua = KUNJUNGI.flatMap((d) => {
  const p = path.join(AKAR, d);
  return fs.existsSync(p) ? berkas(p) : [];
});

const isi = new Map(semua.map((f) => [f, fs.readFileSync(f, 'utf8')]));

// Kumpulkan nama yang diekspor tiap berkas.
const ekspor = [];
for (const [f, s] of isi) {
  const rel = path.relative(AKAR, f).replace(/\\/g, '/');
  const pola = [
    /export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g,
    /export\s+const\s+([A-Za-z0-9_]+)/g,
    /export\s+let\s+([A-Za-z0-9_]+)/g,
    /export\s+type\s+([A-Za-z0-9_]+)/g,
    /export\s+default\s+function\s+([A-Za-z0-9_]+)/g,
  ];
  for (const p of pola) {
    let m;
    while ((m = p.exec(s))) ekspor.push({ berkas: rel, nama: m[1], bawaan: /default/.test(p.source) });
  }
  // Ekspor bernama bergaya daftar: export { a, b }
  const daftar = /export\s*\{([^}]+)\}/g;
  let m;
  while ((m = daftar.exec(s))) {
    for (const bagian of m[1].split(',')) {
      const nama = bagian.trim().split(/\s+as\s+/).pop().trim();
      if (nama && /^[A-Za-z0-9_]+$/.test(nama)) ekspor.push({ berkas: rel, nama, bawaan: false });
    }
  }
}

// Berkas yang boleh tanpa ekspor: tata letak, halaman, dan sejenisnya.
const ISTIMEWA = /^app\/(layout|page|not-found|globals|sitemap|robots)|page\.tsx$|layout\.tsx$/;

// Nama yang dipanggil Next.js sendiri, bukan oleh kode kita. Kalau ini ikut
// dilaporkan sebagai menganggur, hasilnya positif palsu yang membingungkan.
const KONVENSI_NEXT = new Set([
  'viewport',
  'metadata',
  'generateMetadata',
  'generateStaticParams',
  'generateViewport',
  'revalidate',
  'dynamic',
  'dynamicParams',
  'fetchCache',
  'runtime',
  'preferredRegion',
  'maxDuration',
  'metadataBase',
]);

const hasil = [];
const dilihat = new Set();

for (const e of ekspor) {
  const kunci = `${e.berkas}::${e.nama}`;
  if (dilihat.has(kunci)) continue;
  dilihat.add(kunci);

  if (e.bawaan && ISTIMEWA.test(e.berkas)) continue;
  if (KONVENSI_NEXT.has(e.nama)) continue;
  if (/^app\//.test(e.berkas) && e.bawaan) continue;

  // Hitung kemunculan nama di berkas lain.
  let dipakai = 0;
  const pemakai = [];
  for (const [f, s] of isi) {
    const rel = path.relative(AKAR, f).replace(/\\/g, '/');
    if (rel === e.berkas) continue;
    // Cocokkan sebagai kata utuh.
    const re = new RegExp(`\\b${e.nama}\\b`);
    if (re.test(s)) {
      dipakai++;
      pemakai.push(rel);
    }
  }

  if (dipakai === 0) {
    hasil.push({ ...e, pemakai });
  }
}

console.log(`Berkas diperiksa: ${semua.length}`);
console.log(`Ekspor diperiksa: ${dilihat.size}`);
console.log('');

if (hasil.length === 0) {
  console.log('Tidak ada ekspor yang menganggur.');
} else {
  console.log(`Ekspor tanpa pemakai (${hasil.length}):`);
  for (const h of hasil.sort((a, b) => a.berkas.localeCompare(b.berkas))) {
    console.log(`  ${h.berkas.padEnd(42)} ${h.nama}`);
  }
}

// Berkas yang tidak diimpor siapa pun.
console.log('');
const yatim = [];
for (const [f, s] of isi) {
  const rel = path.relative(AKAR, f).replace(/\\/g, '/');
  if (/^app\//.test(rel)) continue; // halaman dan tata letak dipanggil Next
  if (rel === 'lib/utils.ts') {
    // Tetap dipakai walau hanya lewat alias.
  }
  const namaBerkas = path.basename(f, path.extname(f));
  let diimpor = false;
  for (const [g, t] of isi) {
    if (g === f) continue;
    if (new RegExp(`["'\`][^"'\`]*/${namaBerkas}["'\`]`).test(t)) {
      diimpor = true;
      break;
    }
  }
  if (!diimpor) yatim.push(rel);
}

if (yatim.length === 0) {
  console.log('Tidak ada berkas yatim.');
} else {
  console.log(`Berkas tidak diimpor siapa pun (${yatim.length}):`);
  for (const y of yatim) console.log(`  ${y}`);
}
