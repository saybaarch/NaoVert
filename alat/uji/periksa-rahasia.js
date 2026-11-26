/**
 * Periksa rahasia sebelum dikirim ke GitHub.
 *
 * Membaca setiap berkas yang akan ikut di-commit, lalu mencari pola yang
 * menyerupai kunci, token, kata sandi, atau nomor rekening. Berkas yang
 * diabaikan .gitignore tidak diperiksa karena tidak akan terkirim.
 *
 *   node alat/uji/periksa-rahasia.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AKAR = path.resolve(__dirname, '..', '..');

// Pola yang menandakan rahasia. Sengaja dibuat ketat supaya tidak berisik,
// tetapi tetap menangkap bentuk yang benar benar berbahaya.
const POLA = [
  { nama: 'token GitHub', re: /gh[pousr]_[A-Za-z0-9]{20,}/ },
  { nama: 'token GitHub halus', re: /github_pat_[A-Za-z0-9_]{20,}/ },
  { nama: 'kunci Supabase', re: /sbp_[A-Za-z0-9]{20,}/ },
  { nama: 'kunci layanan Supabase', re: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{20,}/ },
  { nama: 'kunci OpenAI', re: /sk-[A-Za-z0-9]{20,}/ },
  { nama: 'kunci AWS', re: /AKIA[0-9A-Z]{16}/ },
  { nama: 'kunci privat', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { nama: 'kata sandi tertulis', re: /(password|passwd|sandi|secret)\s*[:=]\s*["'][^"'\s]{8,}["']/i },
  { nama: 'token tertulis', re: /(token|api_key|apikey)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["']/i },
];

// Berkas yang memang boleh memuat contoh dan nama kunci tanpa nilai.
const DIKECUALIKAN = [/\.md$/, /periksa-rahasia\.js$/];

function berkasTerlacak() {
  try {
    const keluaran = execSync('git ls-files -z', { cwd: AKAR, encoding: 'utf8' });
    const terlacak = keluaran.split('\0').filter(Boolean);
    if (terlacak.length) return terlacak;
  } catch {
    // Belum ada repositori, atau git belum siap.
  }
  // Kalau belum ada commit, tanyakan ke git apa yang akan ditambahkan.
  try {
    const keluaran = execSync('git ls-files -z --others --exclude-standard --cached', {
      cwd: AKAR,
      encoding: 'utf8',
    });
    return keluaran.split('\0').filter(Boolean);
  } catch {
    return [];
  }
}

const daftar = berkasTerlacak();
const temuan = [];

for (const rel of daftar) {
  if (DIKECUALIKAN.some((r) => r.test(rel))) continue;
  const p = path.join(AKAR, rel);
  if (!fs.existsSync(p)) continue;

  const stat = fs.statSync(p);
  if (stat.size > 2_000_000) continue; // berkas besar, bukan sumber

  let isi;
  try {
    isi = fs.readFileSync(p, 'utf8');
  } catch {
    continue;
  }
  if (isi.includes('\u0000')) continue; // biner

  const baris = isi.split('\n');
  for (let i = 0; i < baris.length; i++) {
    for (const p2 of POLA) {
      if (p2.re.test(baris[i])) {
        // Tampilkan nama polanya saja, jangan pernah nilainya.
        temuan.push(`${rel}:${i + 1}  terlihat seperti ${p2.nama}`);
      }
    }
  }
}

// Periksa juga: berkas rahasia tidak boleh terlacak git.
const TERLARANG = ['admin.txt', 'gobiz.txt', 'github & supabase token.txt'];
for (const t of TERLARANG) {
  if (daftar.includes(t)) temuan.push(`${t} TERLACAK GIT, seharusnya diabaikan`);
}

console.log(`Berkas diperiksa: ${daftar.length}`);

if (temuan.length === 0) {
  console.log('BERSIH: tidak ada rahasia yang akan terkirim.');
} else {
  console.log(`\nPERHATIAN (${temuan.length}):`);
  for (const t of temuan) console.log('  ' + t);
  process.exit(1);
}
