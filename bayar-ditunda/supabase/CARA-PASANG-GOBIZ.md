# Menyiapkan pembayaran QRIS GoBiz

Halaman pembayaran di `beli.html` sudah selesai dan sudah diuji. Satu hal yang
belum bisa diisi dari sisi saya: kredensial GoBiz milik akun GoPay Merchant
Sayba Arc. Kredensial itu hanya muncul di portal developer GoBiz setelah kamu
mendaftar sebagai partner, jadi harus kamu ambil sendiri.

Setelah lima nilai di bawah diisi, halaman langsung menerima pembayaran
sungguhan tanpa perlu mengubah satu baris kode pun.

## 1. Daftar partner GoBiz

1. Buka https://developer.gobiz.com dan daftar dengan akun GoBiz merchant
   SAYBA ARC.
2. Buat aplikasi baru. Pilih model integrasi **Direct Integration**, karena
   situs NaoVert bertindak sebagai merchant sendiri, bukan perantara.
3. Minta scope berikut untuk aplikasi itu:
   - `payment:transaction:write`
   - `payment:transaction:read`
4. Catat tiga nilai dari halaman aplikasi: **Client ID**, **Client Secret**,
   dan **Outlet ID** (kadang tertulis `G0000...`).

Kalau kamu ingin mencoba dulu tanpa uang sungguhan, pakai kredensial sandbox.
Alamat sandbox berbeda dari alamat produksi, dan itu diatur lewat nilai
`GOBIZ_BASE_URL` serta `GOBIZ_OAUTH_URL` di langkah 3.

## 2. Pasang alamat notifikasi

Di halaman pengaturan aplikasi GoBiz, isi URL notifikasi dengan:

```
https://zxoszpvrzgcsobivlgaq.supabase.co/functions/v1/bayar
```

GoBiz akan mengirim notifikasi ke alamat itu setiap status transaksi berubah.
Situs juga tetap bertanya sendiri ke GoBiz tiap beberapa detik, jadi
pembayaran terdeteksi walau notifikasi telat atau tidak sampai.

Saat membuat kunci notifikasi, GoBiz menampilkan **Notification Secret Key**.
Simpan nilai itu, karena dipakai di langkah 3.

## 3. Isi nilai rahasia di server

Semua nilai ini disimpan di sisi server Supabase, bukan di dalam halaman.
Halaman `beli.html` tidak memuat satu pun kunci, jadi aman dibuka siapa saja.

Cara paling mudah lewat dasbor Supabase, menu **Edge Functions**, lalu
**Secrets**:

| Nama | Isi |
| --- | --- |
| `GOBIZ_CLIENT_ID` | Client ID dari langkah 1 |
| `GOBIZ_CLIENT_SECRET` | Client Secret dari langkah 1 |
| `GOBIZ_OUTLET_ID` | Outlet ID dari langkah 1 |
| `GOBIZ_WEBHOOK_SECRET` | Notification Secret Key dari langkah 2 |
| `GOBIZ_BASE_URL` | `https://api.gobiz.co.id` untuk produksi, atau alamat sandbox |
| `GOBIZ_OAUTH_URL` | `https://accounts.go-jek.com` untuk produksi, atau alamat sandbox |

Catatan: Secret Key notifikasi di Supabase memakai nama yang sudah dipakai
fungsi. Kalau kamu mengubah namanya, sesuaikan juga di
`supabase/fungsi/bayar/index.ts`.

## 4. Periksa hasilnya

1. Buka `beli.html`, isi email, lalu tekan tombol tampilkan kode.
2. Kode QRIS muncul dengan nominal Rp15.000 dan nomor pesanan NaoVert.
3. Bayar memakai aplikasi apa pun yang mendukung QRIS.
4. Halaman berubah sendiri menjadi lunas, lalu menampilkan kunci lisensi.

Kalau langkah 1 gagal dengan pesan "Pembayaran lewat QRIS belum dibuka",
artinya salah satu dari enam nilai di langkah 3 masih kosong.

## Yang sudah dibuktikan sebelum kredensial diisi

Karena kredensial asli belum ada, jalur pembayaran diuji memakai server tiruan
yang meniru bentuk jawaban GoBiz sesuai dokumentasinya. Dari uji itu terbukti:

- permintaan token memakai jalur `/oauth2/token` dengan scope
  `payment:transaction:write` dan `payment:transaction:read`;
- pembuatan transaksi memakai `POST /integrations/payment/outlets/{id}/v2/transactions`
  dengan `payment_type: qris`, nominal 15000, dan `Idempotency-Key` 32 karakter;
- kode QRIS dari jawaban GoBiz digambar apa adanya di halaman, dan kode itu
  terbaca pemindai QR sungguhan;
- status `pending` berubah menjadi `lunas` setelah GoBiz melaporkan
  `settlement`, dan kunci lisensi terbit sendiri;
- nomor pesanan yang salah ditolak, jadi orang lain tidak bisa membuka lisensi;
- pembayaran yang masuk setelah hitung mundur habis tetap menerbitkan lisensi.

Berkas uji tiruan ada di `alat/uji/gobiz-tiruan/palsu.ts`. Berkas itu tidak
pernah dipasang di server produksi, dan seluruh data uji sudah dihapus.

## Masa berlaku

Lisensi berlaku 30 hari sejak pembayaran masuk. GoBiz tidak menyediakan
langganan berulang, jadi pembayaran berikutnya dilakukan manual. Kode QRIS dari
GoBiz berlaku sampai seminggu, sementara hitung mundur di halaman hanya
mengatur tampilan, bukan masa berlaku kode.
