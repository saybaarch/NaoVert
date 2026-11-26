#!/usr/bin/env node
/**
 * Menurunkan data/format.json dari registry format aplikasi NaoVert.
 *
 * Sumber kebenaran ada di ../NaoVert/src/main/formats.js. Skrip ini membacanya
 * lalu menambahkan penjelasan bahasa manusia untuk setiap keluarga format.
 * Dengan begitu website tidak pernah menampilkan format yang tidak dikenal
 * aplikasi.
 *
 * Jalankan dari folder website:
 *   node alat/ambil-format.js
 */

const fs = require('fs');
const path = require('path');

const AKAR = path.resolve(__dirname, '..');
const SUMBER = path.resolve(AKAR, '..', 'NaoVert', 'src', 'main', 'formats.js');

if (!fs.existsSync(SUMBER)) {
  console.error('Registry format tidak ditemukan di: ' + SUMBER);
  process.exit(1);
}

const F = require(SUMBER);

/** Penjelasan per keluarga. Ditulis untuk pembaca, bukan untuk pengembang. */
const PENJELASAN = {
  image: {
    judul: 'Gambar',
    ringkas: 'Format foto, grafik layar, dan berkas gambar mentah kamera.',
    detail:
      'Gambar dibaca dan ditulis di dalam aplikasi memakai libvips, pustaka yang sama yang dipakai layanan foto besar karena hemat memori dan cepat. Untuk format yang tidak bisa ditulis libvips, NaoVert memakai ImageMagick yang ikut terpasang. RAW kamera dibaca lewat jalur yang sama.',
    catatan:
      'HEIC dan HEIF bisa dibaca, tetapi belum bisa ditulis karena pustaka yang dipakai tidak menyediakan penulisnya. Format itu tidak pernah muncul sebagai pilihan.',
  },
  document: {
    judul: 'Dokumen',
    ringkas: 'Naskah, catatan, dan berkas kantor saling bertukar isi.',
    detail:
      'Pandoc menangani perpindahan antar bahasa naskah dengan tataan yang rapi: judul, daftar, tabel, tautan, dan gambar tetap terbawa. Untuk Word ke PDF, NaoVert memakai mesin tata letak yang sudah ada di dalam aplikasi, jadi tidak perlu memasang LibreOffice.',
    catatan:
      'Berkas Word, Excel, dan PowerPoint lama (.doc, .xls, .ppt) hanya bisa dibaca bila LibreOffice tersedia. Selama belum ada, format itu tidak ditawarkan sebagai sumber.',
  },
  pdf: {
    judul: 'PDF',
    ringkas: 'Menggabung, memisah, dan mengubah PDF menjadi gambar atau teks.',
    detail:
      'PDF ditangani tanpa mesin luar untuk pekerjaan umum: menggabung halaman, mengambil teks, dan merender halaman menjadi gambar. Untuk PDF hasil pindaian yang hanya berisi gambar, hasil teksnya mengikuti apa yang benar-benar ada di dalam berkas.',
    catatan: '',
  },
  media: {
    judul: 'Video dan Audio',
    ringkas: 'Rekaman gambar bergerak dan suara, termasuk pengambilan ulang.',
    detail:
      'FFmpeg terpasang menyatu dengan aplikasi, jadi pengubahan wadah, pemotongan, dan pengambilan ulang berjalan tanpa memasang apa pun lagi. Pilihan mutu dan ukuran mengikuti kebutuhan berkas, bukan satu setelan pukul rata.',
    catatan:
      'Pengambilan ulang video memakan waktu sebanding dengan durasinya. Berkas berdurasi panjang sebaiknya dijalankan saat komputer tidak dipakai untuk hal berat.',
  },
  ebook: {
    judul: 'E-Book',
    ringkas: 'Buku digital dan naskah panjang untuk pembaca layar.',
    detail:
      'Buku digital diperlakukan sebagai dokumen bersusun, bukan sebagai berkas biner. Bab, judul, dan gambar tetap tersusun saat berpindah ke format lain.',
    catatan: '',
  },
  data: {
    judul: 'Data dan Tabel',
    ringkas: 'Data terstruktur: baris, kolom, dan berkas pertukaran data.',
    detail:
      'SheetJS membaca dan menulis tabel dengan tipe sel yang dipertahankan, termasuk angka, tanggal, dan teks. Data dari aplikasi lain bisa diubah menjadi tabel yang bisa dibuka di aplikasi perkantoran.',
    catatan: '',
  },
  spreadsheet: {
    judul: 'Lembar Kerja',
    ringkas: 'Buku kerja dengan banyak lembar, rumus, dan tataan cetak.',
    detail:
      'Lembar kerja bisa diubah menjadi PDF dengan orientasi mendatar dan margin yang diatur, sehingga tabel lebar tetap terbaca. Hasil PDF memuat teks yang bisa dipilih dan dicari.',
    catatan: '',
  },
  archive: {
    judul: 'Arsip',
    ringkas: 'Wadah berkas banyak: dibuka, dibuat, dan diubah bentuknya.',
    detail:
      'Arsip dibaca dan ditulis di dalam aplikasi. Isi arsip tidak diubah, hanya wadahnya yang diganti, jadi nama dan susunan folder tetap seperti aslinya.',
    catatan:
      'Arsip tidak pernah dipilih otomatis sebagai tujuan, karena mengganti wadah tanpa alasan yang jelas jarang berguna.',
  },
  font: {
    judul: 'Font',
    ringkas: 'Berkas huruf untuk web dan untuk komputer.',
    detail:
      'Berkas huruf dibaca sampai ke tingkat huruf dan tabel metrik, lalu ditulis ulang ke format lain tanpa kehilangan bentuk glyph. Berguna untuk menyiapkan huruf web dari berkas desktop.',
    catatan: '',
  },
  vector: {
    judul: 'Vektor',
    ringkas: 'Gambar berbasis garis, bukan piksel.',
    detail:
      'Gambar vektor bisa diubah menjadi gambar biasa pada ukuran berapa pun, atau dipindahkan ke format vektor lain. Karena vektor tidak kehilangan ketajaman, hasilnya tetap bersih di ukuran besar.',
    catatan: '',
  },
  cad: {
    judul: 'CAD',
    ringkas: 'Gambar teknik dari AutoCAD dan program sejenis.',
    detail:
      'Berkas DWG dan DXF dibaca di dalam aplikasi memakai LibreDWG yang berjalan sebagai WebAssembly, jadi tidak perlu memasang AutoCAD. Gambar teknik bisa diubah menjadi PDF atau gambar biasa untuk dikirim ke orang yang tidak punya program CAD.',
    catatan:
      'Berkas DWG hanya dibaca. NaoVert tidak pernah menulis ulang berkas DWG asli, jadi gambar kerja tetap utuh.',
  },
  subtitle: {
    judul: 'Subtitle',
    ringkas: 'Teks waktu untuk film dan video.',
    detail:
      'Subtitle dipindah antar format dengan waktu yang dipertahankan sampai ke milidetik, termasuk format yang memakai titik sebagai pemisah desimal.',
    catatan: '',
  },
  text: {
    judul: 'Teks dan Kode',
    ringkas: 'Berkas teks polos, catatan, dan berkas kode.',
    detail:
      'Berkas teks dibaca apa adanya. Pengubahan enkoding dilakukan dengan memeriksa isi, bukan dengan menebak dari nama berkas, sehingga huruf beraksen tidak rusak.',
    catatan: '',
  },
};

/** Nama mesin dalam bahasa manusia. */
const NAMA_MESIN = {
  sharp: 'libvips',
  imagemagick: 'ImageMagick',
  pandoc: 'Pandoc',
  libreoffice: 'LibreOffice',
  ffmpeg: 'FFmpeg',
  ghostscript: 'Ghostscript',
  'pdf-lib': 'pdf-lib',
  xlsx: 'SheetJS',
  mammoth: 'Mammoth',
  jszip: 'JSZip',
  yauzl: 'yauzl',
  archiver: 'Archiver',
  'fonteditor-core': 'fonteditor-core',
  libredwg: 'LibreDWG',
  builtin: 'NaoVert Core',
};

const keluarga = F.FAMILIES.map((f) => {
  const p = PENJELASAN[f.id] || {};
  return {
    id: f.id,
    judul: p.judul || f.label,
    label: f.label,
    ikon: f.icon,
    ringkas: p.ringkas || '',
    detail: p.detail || '',
    catatan: p.catatan || '',
    mesin: NAMA_MESIN[f.engine] || f.engine,
    mesinCadangan: f.fallbackEngine ? NAMA_MESIN[f.fallbackEngine] || f.fallbackEngine : null,
    masuk: f.in,
    keluar: f.out,
    jumlahMasuk: f.in.length,
    jumlahKeluar: f.out.length,
  };
});

const ekstensi = typeof F.allExtensions === 'function' ? F.allExtensions() : [];

const totalMasuk = keluarga.reduce((n, k) => n + k.jumlahMasuk, 0);
const totalKeluar = keluarga.reduce((n, k) => n + k.jumlahKeluar, 0);
const semuaKeluar = [...new Set(keluarga.flatMap((k) => k.keluar))].sort();

const hasil = {
  dibuat: new Date().toISOString().slice(0, 10),
  sumber: 'NaoVert/src/main/formats.js',
  ringkasan: {
    keluarga: keluarga.length,
    formatMasuk: totalMasuk,
    targetKeluar: totalKeluar,
    ekstensiDikenal: ekstensi.length,
    formatKeluarUnik: semuaKeluar.length,
  },
  keluarga,
  ekstensi,
  formatKeluar: semuaKeluar,
};

const tujuan = path.join(AKAR, 'data', 'format.json');
fs.mkdirSync(path.dirname(tujuan), { recursive: true });
fs.writeFileSync(tujuan, JSON.stringify(hasil, null, 1) + '\n', 'utf8');

// Salinan sebagai berkas skrip, supaya halaman tetap bekerja saat dibuka
// langsung dari cakram (file://) tanpa peladen.
const tujuanJs = path.join(AKAR, 'data', 'format.js');
fs.writeFileSync(
  tujuanJs,
  '/* Dibuat oleh alat/ambil-format.js. Jangan diubah tangan. */\n' +
    'window.NAOVERT_FORMAT = ' +
    JSON.stringify(hasil) +
    ';\n',
  'utf8'
);

console.log('data/format.json ditulis');
console.log('  keluarga      : ' + hasil.ringkasan.keluarga);
console.log('  format masuk  : ' + hasil.ringkasan.formatMasuk);
console.log('  target keluar : ' + hasil.ringkasan.targetKeluar);
console.log('  ekstensi      : ' + hasil.ringkasan.ekstensiDikenal);
console.log('  keluar unik   : ' + hasil.ringkasan.formatKeluarUnik);
