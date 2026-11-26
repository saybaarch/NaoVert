/**
 * Satu sumber kebenaran untuk seluruh isi situs.
 *
 * Semua angka dibaca dari data/format.json yang dihasilkan alat pengambil
 * data, bukan ditulis tangan. Kalau kemampuan aplikasi berubah, angka di
 * halaman ikut berubah tanpa ada yang perlu mengingatnya.
 *
 * Catatan tentang bahasa: seluruh naskah di berkas ini ditulis dengan kalimat
 * pendek dan kata kerja yang jelas, mengikuti cara bercerita halaman acuan.
 * Tidak ada istilah pemasaran, tidak ada kata sifat yang tidak bisa dibuktikan.
 */

import formatData from "@/data/format.json";

/* ── identitas ─────────────────────────────────────────────────────────── */

/**
 * Alamat situs dibaca dari variabel lingkungan supaya domain bisa diganti di
 * Vercel tanpa mengubah kode. Nilai cadangannya alamat yang dipakai sekarang,
 * jadi bangunan tetap benar walau variabelnya belum diisi.
 *
 * Memakai awalan NEXT_PUBLIC_ karena objek ini juga dipakai komponen klien.
 * Kalau hanya tersedia di server, hasil render server dan klien bisa berbeda
 * dan React akan mengeluh saat hidrasi. Alamat situs bukan rahasia.
 */
const alamatSitus =
  process.env.NEXT_PUBLIC_SITUS_URL?.replace(/\/+$/, "") || "https://naovert.sayba.id";

export const situs = {
  nama: "NaoVert",
  pembuat: "Sayba Arc",
  pembuatUrl: "https://sayba.id",
  url: alamatSitus,
  keterangan:
    "NaoVert mengubah gambar, dokumen, PDF, video, audio, data, e-book, arsip, font, vektor, CAD, dan subtitle di satu aplikasi Windows. Seluruh mesin konversi sudah ikut terpasang.",
  versi: "1.0.0",
  sistem: "Windows 10 dan 11, 64 bit",
} as const;

/* ── navigasi ──────────────────────────────────────────────────────────── */

export const navigasi = [
  { label: "Kategori", href: "/#kemampuan" },
  { label: "Cara kerja", href: "/#cara" },
  { label: "Format", href: "/format" },
  { label: "Panduan", href: "/panduan" },
] as const;

/* ── bentuk data ───────────────────────────────────────────────────────── */

type Keluarga = {
  id: string;
  judul: string;
  label: string;
  ikon: string;
  ringkas: string;
  detail: string;
  catatan?: string;
  mesin: string;
  mesinCadangan?: string;
  masuk: string[];
  keluar: string[];
};

type FormatJson = {
  dibuat: string;
  sumber: string;
  ringkasan: {
    keluarga: number;
    formatMasuk: number;
    targetKeluar: number;
    ekstensiDikenal: number;
    formatKeluarUnik: number;
  };
  keluarga: Keluarga[];
  ekstensi: string[];
  formatKeluar: string[];
};

const data = formatData as unknown as FormatJson;

/* ── angka, dibaca dari ringkasan data ─────────────────────────────────── */

export const keluarga: Keluarga[] = data.keluarga;

const jumlahKeluarga = data.ringkasan.keluarga;
export const jumlahEkstensi = data.ringkasan.ekstensiDikenal;
export const jumlahTujuan = data.ringkasan.targetKeluar;
export const daftarFormatKeluar: string[] = data.formatKeluar;

/**
 * Nama mesin unik yang benar benar ikut terpasang.
 *
 * Hanya kolom `mesin` yang dihitung, bukan `mesinCadangan`. Data mencatat
 * LibreOffice sebagai cadangan untuk Dokumen dan E-Book, padahal LibreOffice
 * tidak ikut terpasang. Kalau cadangan ikut dihitung, angka di halaman akan
 * menjanjikan mesin yang tidak ada.
 */
export const namaMesin: string[] = Array.from(
  new Set(
    data.keluarga
      .map((k) => k.mesin)
      .filter((m): m is string => Boolean(m))
      .map((m) => m.trim())
      .filter(Boolean),
  ),
).sort();

const jumlahMesin = namaMesin.length;

/** Empat angka yang tampil di beranda, semuanya dari data. */
export const angka = [
  { nilai: jumlahKeluarga, satuan: "Kategori format" },
  { nilai: jumlahEkstensi, satuan: "Jenis berkas dikenali" },
  { nilai: jumlahTujuan, satuan: "Tujuan konversi" },
  { nilai: jumlahMesin, satuan: "Mesin siap pakai" },
] as const;

/* ── tangkapan layar ───────────────────────────────────────────────────── */

export const tangkapan = {
  integrasi: "/shots/settings-shell.png",
  gabung: "/shots/merge-filled.png",
  jendela: "/shots/app-01.png",
  penjelasan: "/shots/vector-open.png",
} as const;

/* ── media ─────────────────────────────────────────────────────────────── */

export const media = {
  video: "/media/presentasi-naovert.mp4",
  poster: "/media/poster.jpg",
  durasi: "00:21",
} as const;

/* ── naskah bercerita ──────────────────────────────────────────────────── */

/**
 * Naskah beranda disimpan di sini, bukan di dalam komponen.
 *
 * Alasannya: naskah perlu dibaca dan diperbaiki sebagai satu kesatuan, dan
 * dengan cara ini seluruhnya bisa ditinjau tanpa membuka berkas tata letak.
 */

export const bab = [
  {
    nomor: "01",
    judul: ["Semuanya", "harus dipasang sendiri."],
    isi: "Konverter berkas biasanya menuntut satu hal dulu: pasang mesin ini, pasang mesin itu. Belum mulai kerja, waktunya sudah habis untuk memasang.",
  },
  {
    nomor: "02",
    judul: ["Sepuluh mesin,", "satu pemasang."],
    isi: "NaoVert membawa semuanya sejak awal. Gambar, dokumen, video, audio, tabel, e-book, arsip, font, vektor, dan gambar teknik. Setelah pemasang selesai, tidak ada yang perlu ditambahkan.",
  },
  {
    nomor: "03",
    judul: ["Berkas Anda", "tidak ke mana mana."],
    isi: "Tidak ada unggahan, tidak ada akun, tidak ada antrean di server orang lain. Semua proses berjalan di komputer Anda, dan hasilnya masuk ke folder yang sama dengan berkas aslinya.",
  },
] as const;

export const penutup = {
  label: "Sekarang",
  judul: ["Unduh,", "lalu pakai."],
  isi: "Tidak ada langkah tambahan, tidak ada mesin yang harus dicari sendiri. Pasang sekali, langsung bekerja.",
} as const;

/* ── naskah halaman pendukung ──────────────────────────────────────────── */

export type NamaIkon =
  | "perisai"
  | "mesin"
  | "timbangan"
  | "dokumen"
  | "lipat"
  | "lapis";

export const langkah = [
  {
    nomor: "01",
    judul: "Masukkan berkas",
    isi: "Seret berkas ke jendela aplikasi, atau pilih lewat tombol tambah. Bisa banyak berkas sekaligus, termasuk dari folder berbeda.",
  },
  {
    nomor: "02",
    judul: "Pilih format tujuan",
    isi: "NaoVert hanya menampilkan format yang benar benar bisa ditulis untuk berkas itu. Format yang tidak bisa dihasilkan tidak pernah muncul sebagai pilihan.",
  },
  {
    nomor: "03",
    judul: "Jalankan",
    isi: "Hasil muncul di folder yang sama dengan berkas aslinya. Berkas asli tidak pernah diubah, jadi selalu ada salinan yang aman.",
  },
] as const;

/** Alasan yang bisa dibuktikan, dipakai di halaman tentang. */
export const kemampuan: { judul: string; isi: string; ikon: NamaIkon }[] = [
  {
    judul: "Berkas tidak meninggalkan komputer",
    isi: "Seluruh proses berjalan di perangkat Anda. Tidak ada unggahan, tidak ada akun, tidak ada antrean server.",
    ikon: "perisai",
  },
  {
    judul: "Mesin sudah terpasang menyatu",
    isi: `${namaMesin.length} mesin konversi ikut terpasang bersama aplikasi. Tidak ada langkah tambahan setelah pemasangan.`,
    ikon: "mesin",
  },
  {
    judul: "Tidak menjanjikan yang tidak bisa",
    isi: "Format tujuan disusun dari kemampuan mesin yang benar benar ada. Kalau sebuah format tidak bisa ditulis, format itu tidak ditawarkan.",
    ikon: "timbangan",
  },
  {
    judul: "Tidak perlu LibreOffice",
    isi: "Word, Excel, dan HTML bisa diubah menjadi PDF tanpa memasang paket perkantoran.",
    ikon: "dokumen",
  },
  {
    judul: "Penjelasan yang bisa dibuka",
    isi: "Setiap format punya keterangan singkat yang bisa dibuka dan ditutup, jadi layar tetap lapang.",
    ikon: "lipat",
  },
  {
    judul: "Satu tampilan gelap yang tenang",
    isi: "Aplikasi dan situs memakai satu sistem warna yang sama, tanpa warna menyala yang membuat mata cepat lelah.",
    ikon: "lapis",
  },
];
