# ACUAN DESAIN NAOVERT WEBSITE

Berkas ini adalah acuan tetap proyek. Dibuat atas permintaan pemilik proyek
pada 27 November 2026, dengan pesan: "sebelum lanjut kerjakan ini dulu, simpan
aturan ini agar kamu tidak lupa, ingat ini jangan sampai lupa".

Aturan main berkas ini: dibaca di awal setiap sesi kerja pada proyek ini,
isinya tidak boleh diubah tanpa perintah pemilik, dan keutuhannya bisa dicek
dengan `node alat/cek-acuan.js` (keluar 0 = berkas masih utuh seperti saat
disimpan).

## 1. Aturan kerja (ditetapkan 27 November 2026, jam 11:27)

1. **Jangan pernah berhenti atau menyerah** saat bekerja pada proyek ini.
   Jika satu cara gagal, cari cara lain, lalu lanjut.
2. **Jangan ubah acuan ini.** Berkas ini hanya boleh diganti bila pemilik
   proyek sendiri yang memerintahkan.
3. **Jangan ganggu folder di luar dua ruang kerja yang ditentukan:**
   - situs: folder proyek ini (`NaoVert Website`)
   - aplikasi: folder `NaoVert` di sebelahnya
   Folder `SAYBA ARC (WEB CODE)` (termasuk Sayba.arc-main) hanya dibaca.

## 2. Arah desain (ditetapkan 27 November 2026, jam 12:15)

1. **Acuan gaya:** repo GeoFold di
   `E:\SAYBA ARC (BUSSINESS)\SAYBA ARC (WEB CODE)\GEOFOLD PROJECT\GeoFold`.
   Yang diambil hanyalah POLA teknisnya (kaca hemat, fallback opaque, blur
   mati di ponsel, scroll-snap, jeda saat tak terlihat). Identitas visual
   GeoFold (topografi, biru, kisi teknik) tidak ikut.
2. **Kaca (glassmorphism) dipakai hemat:** hanya navbar kapsul, menu ponsel,
   dan satu atau dua permukaan istimewa. Semua elemen lain tetap solid.
   Situs tidak boleh jadi kaca semua.
3. **Ringan di atas indah:** tanpa pustaka berat, `will-change` dan blur
   ditahan sampai 2 elemen aktif, animasi berhenti di luar layar, dan
   `prefers-reduced-motion` selalu dihormati.
4. **Mobile adalah warga kelas satu:** tanpa gulir mendatar, sasaran sentuh
   minimal 44px, blur latar diturunkan ke permukaan opaque di layar sempit,
   galeri menjadi karosel geser dengan scroll-snap.
5. **Video panduan tanpa suara.** Penjelasan lewat teks bergerak dan
   transisi, bukan narasi audio.
6. **Logo adalah logo asli aplikasi** (`NaoVert/assets/logo-256.png` dan
   `logo-light-256.png`). Jangan menggambar ulang logo ke bentuk lain. Aset
   3D hero boleh tetap benda WebGL, tapi bentuknya mengikuti logo asli dan
   bisa diputar dengan sentuhan/kursor, serta ukurannya ikut layar.
7. **Bahasa dan tulisan:** seluruh teks produk bahasa Indonesia, tanpa em
   dash, tanpa klaim palsu, tanpa kata pemasaran kosong.
8. **Tema ganda:** gelap dan terang dua-duanya harus lulus kontras WCAG AA
   dan sudah diuji sebelum dikirim.
9. **Warna milik NaoVert:** latar #16181b, tinta #eeeae4, tembaga #c07d4f,
   radius 6px; terang: #f2efe9 / #17191c / #96541f. Tanpa gradasi neon.
10. **Selesai berarti terkirim:** build hijau, uji peramban bersih, commit,
    push ke `github.com/saybaarch/NaoVert`, lalu deploy Vercel
    (project `sayba-arc/naovert`, token di berkas kredensial terbaru).

## 3. Cara memakai acuan ini

- Pembukaan sesi: baca berkas ini sampai tuntas sebelum menyentuh kode.
- Sebelum commit: `node alat/cek-acuan.js` (memastikan berkas ini tidak
  berubah) dan `node alat/uji/periksa-rahasia.js` (memastikan tidak ada
  token yang ikut).
- Berkas kredensial (`github & supabase token & Vercel.txt`, `admin.txt`,
  `gobiz.txt`) tidak pernah dibaca ke layar, dicetak, atau di-commit.
