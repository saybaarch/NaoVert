-- NaoVert: mode pembayaran QRIS statis.
--
-- Dipakai bila kredensial API GoBiz belum ada. Kode QRIS merchant yang sama
-- dipakai berulang, jadi setiap pesanan diberi nominal unik beberapa rupiah
-- di atas harga dasar. Nominal itulah yang membedakan pembayar satu dengan
-- yang lain saat kamu memeriksa mutasi GoPay.
--
-- Kolom mode memisahkan kedua cara supaya pesanan lama tidak tercampur.

alter table public.pesanan
  add column if not exists mode text not null default 'gobiz'
  check (mode in ('gobiz', 'statis'));

-- Nominal tidak boleh dipakai dua pesanan yang sama-sama menunggu.
create index if not exists pesanan_statis_idx
  on public.pesanan (jumlah)
  where status = 'menunggu' and mode = 'statis';

-- Pencarian cepat saat halaman menanyakan status.
create index if not exists pesanan_mode_status_idx
  on public.pesanan (mode, status, dibuat_pada desc);

-- Catatan tindakan admin, supaya jelas siapa menandai lunas dan kapan.
create table if not exists public.catatan_admin (
  id            bigserial primary key,
  pesanan_id    uuid references public.pesanan (id) on delete cascade,
  tindakan      text not null,
  keterangan    text,
  dibuat_pada   timestamptz not null default now()
);

alter table public.catatan_admin enable row level security;
