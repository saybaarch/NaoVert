# NaoVert

Situs resmi NaoVert, konverter berkas untuk Windows yang membawa seluruh mesin
konversinya sejak pemasangan pertama. Dibuat oleh [Sayba Arc](https://sayba.id).

## Isi

Situs ini punya lima halaman:

| Halaman | Alamat | Isi |
| --- | --- | --- |
| Beranda | `/` | Cerita tiga bab, angka kemampuan, daftar kategori, video, galeri |
| Format | `/format` | Pencarian 13 kategori format, 144 jenis berkas, 150 tujuan |
| Unduh | `/unduh` | Keterangan pemasang dan langkah pemasangan |
| Panduan | `/panduan` | Tiga langkah pemakaian dan pertanyaan yang sering muncul |
| Tentang | `/tentang` | Alasan aplikasi ini dibuat dan mesin yang ikut terpasang |

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

Untuk membuat bangunan produksi:

```bash
npm run build
npm start
```

## Susunan berkas

```
app/            halaman dan tata letak App Router
components/     komponen tampilan, satu berkas satu tugas
hooks/          kait React yang dipakai bersama
lib/            satu sumber isi dan naskah (lib/data.ts)
data/           data kemampuan format, hasil pengambilan dari aplikasi
public/         gambar, video, dan ikon yang disajikan apa adanya
alat/           alat bantu pengambilan data dan pengujian
bayar-ditunda/  pekerjaan pembayaran yang belum diaktifkan
```

Isi halaman tidak ditulis di dalam komponen. Seluruh naskah dan angka tinggal di
`lib/data.ts`, dan angka kemampuannya dibaca dari `data/format.json` yang
dihasilkan aplikasi desktop. Kalau kemampuan aplikasi berubah, situs ikut
berubah tanpa ada yang perlu mengingat angkanya.

## Variabel lingkungan

Situs ini hanya butuh satu variabel, dan bangunan tetap benar walau variabel
itu belum diisi karena ada nilai cadangannya.

| Nama | Isi | Cadangan |
| --- | --- | --- |
| `NEXT_PUBLIC_SITUS_URL` | Alamat lengkap situs, tanpa garis miring di akhir | `https://naovert.sayba.id` |

Di Vercel: Settings, Environment Variables, tambahkan `NEXT_PUBLIC_SITUS_URL`
untuk Production, Preview, dan Development, lalu Redeploy. Daftar lengkapnya
ada di `.env.example`.

Variabel ini dipakai untuk alamat kanonis halaman, `sitemap.xml`, dan
`robots.txt`. Karena itu memakai awalan `NEXT_PUBLIC_`: nilainya juga dibaca
komponen klien, dan kalau hanya tersedia di server hasil render server dan
klien bisa berbeda. Alamat situs bukan rahasia, jadi tidak masalah terbaca.

## Pengujian

Alat uji memakai Chromium sungguhan, jadi hasilnya bukan perkiraan.

```bash
npm run build && npx next start -p 3001   # jalankan dulu

node alat/uji/cari-mati.js       # ekspor dan berkas yang tidak terpakai
node alat/uji/periksa-tautan.js  # tautan mati, em dash, kata terlarang
node alat/uji/uji-perilaku.js    # pencarian, menu ponsel, pemutar video
node alat/uji/periksa-next.js / 1280 900   # luberan tata letak
```

`periksa-next.js` menerima alamat halaman dan ukuran layar, misalnya
`periksa-next.js /format 390 844` untuk menguji tampilan ponsel.

## Catatan pembayaran

Halaman pembelian dan seluruh pekerjaan GoBiz disimpan di `bayar-ditunda/` dan
belum dipakai. Situs ini tampil gratis tanpa akun dan tanpa kunci lisensi.

## Teknologi

Next.js 16 dengan App Router, TypeScript, dan Tailwind CSS 4. Tidak ada HTML
yang ditulis tangan dan tidak ada CSS terpisah di luar `app/globals.css`.
