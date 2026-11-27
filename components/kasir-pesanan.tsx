"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Ikon from "@/components/ikon";
import { paket, rupiah } from "@/lib/harga";

type PaketHarga = (typeof paket)[number];

type Pesanan = {
  id: string;
  paket: string;
  paketNama: string;
  email: string;
  harga: number;
  nominal: number;
  qr: string;
  dibuat: string;
  batasWaktu: string;
  status: "menunggu" | "lunas" | "kedaluwarsa";
  transaksiId?: string;
  lunasPada?: string;
};

function sisa(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const d = total % 60;
  return `${String(m).padStart(2, "0")}:${String(d).padStart(2, "0")}`;
}

export default function KasirPesanan({
  awal,
  tetap = false,
}: {
  awal?: string;
  tetap?: boolean;
}) {
  const [pilih, setPilih] = useState<PaketHarga>(
    paket.find((p) => p.id === awal) ?? paket[0],
  );
  const [email, setEmail] = useState("");
  const [pesanan, setPesanan] = useState<Pesanan | null>(null);
  const [memuat, setMemuat] = useState(false);
  const [pesan, setPesan] = useState("");
  const [detik, setDetik] = useState(0);
  const [salin, setSalin] = useState(false);
  const refSalin = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!pesanan || pesanan.status !== "menunggu") return;
    const hitung = () => {
      const sisaMs = Date.parse(pesanan.batasWaktu) - Date.now();
      setDetik(Math.max(0, Math.floor(sisaMs / 1000)));
    };
    hitung();
    const jam = window.setInterval(hitung, 1000);
    return () => window.clearInterval(jam);
  }, [pesanan]);

  useEffect(() => {
    if (!pesanan || pesanan.status !== "menunggu") return;
    let hidup = true;
    const cek = async () => {
      try {
        const res = await fetch(`/api/pesanan/${pesanan.id}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { pesanan?: Pesanan };
        if (hidup && data.pesanan) setPesanan(data.pesanan);
      } catch {
        /* jaringan putus: coba lagi pada putaran berikutnya */
      }
    };
    const jam = window.setInterval(cek, 5000);
    cek();
    return () => {
      hidup = false;
      window.clearInterval(jam);
    };
  }, [pesanan?.id, pesanan?.status]);

  const mulai = async () => {
    setMemuat(true);
    setPesan("");
    try {
      const res = await fetch("/api/pesanan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paket: pilih.id, email }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        pesanan?: Pesanan;
        message?: string;
      };
      if (!res.ok || !data.pesanan) {
        setPesan(data.message || "Pesanan tidak dapat dibuat. Coba lagi.");
        return;
      }
      setPesanan(data.pesanan);
    } catch {
      setPesan("Tidak dapat menghubungi server. Periksa sambungan lalu coba lagi.");
    } finally {
      setMemuat(false);
    }
  };

  const salinId = async () => {
    if (!pesanan) return;
    try {
      await navigator.clipboard.writeText(pesanan.id);
      setSalin(true);
      window.setTimeout(() => setSalin(false), 1800);
    } catch {
      refSalin.current?.focus();
    }
  };

  if (pesanan) {
    const lunas = pesanan.status === "lunas";
    const habis = pesanan.status === "kedaluwarsa" || (!lunas && detik <= 0);
    return (
      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-garis px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span
              className={`size-2 rounded-full ${lunas ? "bg-tembaga" : habis ? "bg-tinta-3" : "animate-pulse bg-tembaga"}`}
              aria-hidden="true"
            />
            <span className="text-[13px] font-semibold">
              {lunas ? "Pembayaran diterima" : habis ? "Batas waktu habis" : "Menunggu pembayaran"}
            </span>
          </div>
          <button
            type="button"
            onClick={salinId}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-garis px-3 font-mono text-[11px] tracking-[0.04em] text-tinta-2 transition hover:text-tinta"
          >
            {pesanan.id}
            {salin ? <Ikon nama="centang" ukuran={14} /> : null}
          </button>
        </div>

        <div className="grid gap-8 p-6 md:grid-cols-[minmax(0,320px)_1fr] md:p-8">
          <div className="mx-auto w-full max-w-[320px]">
            <div
              className={`rounded-2xl border border-garis bg-white p-3 transition ${
                lunas || habis ? "opacity-30 grayscale" : ""
              }`}
            >
              {/* QR dibuat server sebagai data URL, bukan gambar luar. */}
              <img
                src={pesanan.qr}
                alt={`Kode QRIS untuk pesanan ${pesanan.id}`}
                width={420}
                height={420}
                className="h-auto w-full rounded-lg"
              />
            </div>
            <p className="mt-3 text-center text-[11.5px] text-tinta-3">
              Pindai dengan aplikasi bank atau e-wallet yang mendukung QRIS.
            </p>
          </div>

          <div className="flex flex-col">
            <p className="label">Pesanan</p>
            <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.025em]">
              Lisensi {pesanan.paketNama}
            </h3>

            <dl className="mt-5 space-y-3 border-t border-garis pt-5 text-[13.5px]">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-tinta-2">Harga paket</dt>
                <dd className="tabular-nums">{rupiah.format(pesanan.harga)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-tinta-2">Kode unik</dt>
                <dd className="tabular-nums">{rupiah.format(pesanan.nominal - pesanan.harga)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-garis pt-3">
                <dt className="font-semibold">Total dibayar</dt>
                <dd className="text-[22px] font-bold tracking-[-0.02em] tabular-nums">
                  {rupiah.format(pesanan.nominal)}
                </dd>
              </div>
            </dl>

            {lunas ? (
              <div className="mt-6 rounded-xl border border-tembaga/30 bg-sorot p-4">
                <p className="flex items-center gap-2 text-[14px] font-semibold text-tembaga-teks">
                  <Ikon nama="centang" ukuran={17} />
                  Pembayaran sudah masuk
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-tinta-2">
                  Simpan nomor pesanan ini. Lisensi dibuat dari nomor pesanan dan
                  alamat email yang Anda isi.
                </p>
              </div>
            ) : habis ? (
              <div className="mt-6 rounded-xl border border-garis bg-timbul p-4">
                <p className="text-[14px] font-semibold">Waktu pembayaran habis</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-tinta-2">
                  Kode QRIS sudah tidak berlaku. Buat pesanan baru untuk
                  mendapatkan nominal unik yang baru.
                </p>
                <button
                  type="button"
                  onClick={() => setPesanan(null)}
                  className="tombol mt-4"
                >
                  Buat pesanan baru
                </button>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-garis bg-timbul p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] text-tinta-2">Sisa waktu</p>
                  <p className="font-mono text-[18px] font-semibold tabular-nums text-tembaga-teks">
                    {sisa(detik * 1000)}
                  </p>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-tinta-3">
                  Halaman ini memeriksa pembayaran otomatis setiap lima detik.
                  Biarkan tetap terbuka sampai status berubah.
                </p>
                {tetap ? (
                  <Link
                    href="/harga"
                    className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[12.5px] text-tinta-2 underline-offset-4 hover:text-tinta hover:underline"
                  >
                    Ganti paket di halaman harga
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPesanan(null)}
                    className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[12.5px] text-tinta-2 underline-offset-4 hover:text-tinta hover:underline"
                  >
                    Ganti paket
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-garis px-6 py-5 md:px-8">
        <p className="label">{tetap ? "Paket dipilih" : "Kasir pembayaran"}</p>
        <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.025em]">
          {tetap ? `Lisensi ${pilih.nama}` : "Bayar langsung dengan QRIS"}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-tinta-2">
          {tetap
            ? `${pilih.durasi.toLowerCase()} · ${rupiah.format(pilih.harga)} ${pilih.periode}. Isi email bila ingin lisensi dikirim, lalu buat kode QRIS.`
            : "Pilih paket, lalu pindai kode QRIS. Status lunas muncul sendiri tanpa perlu unggah bukti."}
        </p>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-[1fr_1fr] md:p-8">
        {tetap ? (
          <div className="rounded-xl border border-garis bg-timbul p-5">
            <dl className="space-y-2.5 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-tinta-2">Paket</dt>
                <dd className="font-semibold">Lisensi {pilih.nama}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-tinta-2">Masa aktif</dt>
                <dd>{pilih.durasi.replace("Aktif ", "")}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-tinta-2">Komputer</dt>
                <dd>1 perangkat</dd>
              </div>
              {pilih.hargaAsli > pilih.harga && (
                <div className="flex justify-between gap-3">
                  <dt className="text-tinta-2">Harga asli</dt>
                  <dd>
                    <del className="tabular-nums text-tinta-3">
                      {rupiah.format(pilih.hargaAsli)}
                    </del>
                  </dd>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-3 border-t border-garis pt-3">
                <dt className="font-semibold">Harga</dt>
                <dd className="text-[20px] font-semibold tabular-nums">
                  {rupiah.format(pilih.harga)}
                </dd>
              </div>
            </dl>
            <Link
              href={`/harga/${pilih.id}`}
              className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-[12.5px] text-tinta-2 underline-offset-4 hover:text-tinta hover:underline"
            >
              Baca detail paket ini
            </Link>
          </div>
        ) : (
          <fieldset>
            <legend className="text-[12px] font-semibold text-tinta-2">Pilih paket</legend>
            <div className="mt-3 flex flex-col gap-2.5">
              {paket.map((item) => {
                const ini = pilih.id === item.id;
                return (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition ${
                      ini
                        ? "border-tembaga bg-sorot"
                        : "border-garis bg-panel hover:border-garis-2"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paket"
                        value={item.id}
                        checked={ini}
                        onChange={() => setPilih(item)}
                        className="size-4 accent-[var(--tembaga)]"
                      />
                      <span>
                        <span className="block text-[14px] font-semibold">{item.nama}</span>
                        <span className="block text-[12px] text-tinta-3">{item.durasi}</span>
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-[15px] font-bold tabular-nums">
                        {rupiah.format(item.harga)}
                      </span>
                      <span className="block text-[11px] text-tinta-3">{item.periode}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="flex flex-col">
          <label htmlFor="email-pesanan" className="text-[12px] font-semibold text-tinta-2">
            Email penerima lisensi <span className="font-normal text-tinta-3">(opsional)</span>
          </label>
          <input
            id="email-pesanan"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@contoh.com"
            className="mt-3 h-12 w-full rounded-xl border border-garis bg-timbul px-4 text-[14px] text-tinta placeholder:text-tinta-3 focus:border-tembaga focus:outline-none"
          />
          <p className="mt-2 text-[12px] leading-relaxed text-tinta-3">
            Dipakai untuk mengirim kunci lisensi. Boleh dikosongkan; nomor
            pesanan tetap menjadi bukti pembelian.
          </p>

          <div className="mt-auto pt-6">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] text-tinta-2">Total</span>
              <span className="text-[24px] font-bold tracking-[-0.03em] tabular-nums">
                {rupiah.format(pilih.harga)}
              </span>
            </div>
            <p className="mt-1 text-[11.5px] text-tinta-3">
              Nominal akhir ditambah kode unik Rp1 sampai Rp999 agar pembayaran
              bisa dicocokkan otomatis.
            </p>
            <button
              type="button"
              onClick={mulai}
              disabled={memuat}
              className="tombol mt-4 w-full"
            >
              {memuat ? "Menyiapkan QRIS..." : "Buat kode QRIS"}
              {!memuat && <Ikon nama="panah" ukuran={16} />}
            </button>
            {pesan && (
              <p role="alert" className="mt-3 text-[12.5px] leading-relaxed text-tembaga-teks">
                {pesan}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
