-- NaoVert: pesanan lisensi, kunci lisensi, dan catatan webhook.
-- Semua tabel memakai RLS tanpa kebijakan, jadi kunci publishable tidak bisa
-- membaca atau menulis langsung. Hanya Edge Function dengan kunci layanan
-- yang boleh menyentuh tabel ini.

create table if not exists public.pesanan (
  id                uuid primary key default gen_random_uuid(),
  order_id          text not null unique,
  email             text not null,
  jumlah            integer not null check (jumlah > 0),
  status            text not null default 'menunggu'
                    check (status in ('menunggu','lunas','kedaluwarsa','gagal')),
  gobiz_id          text,
  qris_string       text,
  akses_token       text not null default replace(gen_random_uuid()::text, '-', ''),
  dibuat_pada       timestamptz not null default now(),
  kedaluwarsa_pada  timestamptz not null,
  dibayar_pada      timestamptz,
  terakhir_cek      timestamptz,
  percobaan_cek     integer not null default 0
);

create index if not exists pesanan_email_idx  on public.pesanan (lower(email));
create index if not exists pesanan_status_idx on public.pesanan (status);
create index if not exists pesanan_gobiz_idx  on public.pesanan (gobiz_id);

create table if not exists public.lisensi (
  kunci         text primary key,
  pesanan_id    uuid references public.pesanan (id) on delete cascade,
  email         text not null,
  aktif_dari    timestamptz not null default now(),
  aktif_sampai  timestamptz not null,
  dibuat_pada   timestamptz not null default now()
);

create index if not exists lisensi_email_idx on public.lisensi (lower(email));

create table if not exists public.webhook_masuk (
  id             bigserial primary key,
  diterima_pada  timestamptz not null default now(),
  jenis          text,
  isi            jsonb not null
);

alter table public.pesanan        enable row level security;
alter table public.lisensi        enable row level security;
alter table public.webhook_masuk  enable row level security;

-- Satu pesanan hanya boleh punya satu lisensi.
create unique index if not exists lisensi_pesanan_unik on public.lisensi (pesanan_id);
