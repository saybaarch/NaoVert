"use client";

import { useCallback, useEffect, useState } from "react";
import Ikon from "@/components/ikon";

type Pesanan = {
  id: string;
  nominal: number;
  payload: string;
  qr: string;
  dibuat: string;
  batasWaktu: string;
  status: "menunggu" | "lunas";
  transaksiId?: string;
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

async function panggil<T>(options?: RequestInit): Promise<T> {
  const response = await fetch("/api/gobiz/qris", {
    credentials: "same-origin",
    ...options,
    headers: { "content-type": "application/json", ...(options?.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
  return data as T;
}

function waktu(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export default function QrisUji() {
  const [pesanan, setPesanan] = useState<Pesanan | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState("");
  const [perluKunci, setPerluKunci] = useState(false);

  const periksa = useCallback(async (diam = false) => {
    if (!diam) setSibuk(true);
    try {
      const data = await panggil<{ order: Pesanan | null }>();
      setPesanan(data.order);
      setPerluKunci(false);
      return data.order;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Status QRIS tidak bisa dimuat.";
      if (/kunci|401/i.test(message)) setPerluKunci(true);
      else if (!diam) setPesan(message);
      return null;
    } finally {
      if (!diam) setSibuk(false);
    }
  }, []);

  useEffect(() => {
    periksa().finally(() => setMemuat(false));
  }, [periksa]);

  useEffect(() => {
    if (!pesanan || pesanan.status === "lunas") return;
    const timer = window.setInterval(() => periksa(true), 5000);
    return () => window.clearInterval(timer);
  }, [pesanan, periksa]);

  async function buat() {
    setSibuk(true);
    setPesan("");
    try {
      const data = await panggil<Pesanan>({ method: "POST", body: "{}" });
      setPesanan(data);
      setPesan("QRIS dinamis Rp1.000 siap dipindai.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "QRIS tidak bisa dibuat.";
      if (/kunci|401/i.test(message)) setPerluKunci(true);
      setPesan(message);
    } finally {
      setSibuk(false);
    }
  }

  async function salinPayload() {
    if (!pesanan) return;
    try {
      await navigator.clipboard.writeText(pesanan.payload);
      setPesan("Payload QRIS disalin.");
    } catch {
      setPesan("Payload tidak bisa disalin oleh browser ini.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="panel p-6 md:p-8" aria-labelledby="qris-judul">
        <div className="flex items-center justify-between gap-4">
          <h2 id="qris-judul" className="text-[16.5px] font-semibold tracking-[-0.02em]">
            Kode pembayaran
          </h2>
          <span
            className={`inline-flex min-h-11 items-center rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.08em] ${
              pesanan?.status === "lunas" ? "bg-tembaga text-di-atas-tembaga" : "bg-timbul text-tinta-2"
            }`}
          >
            {pesanan?.status === "lunas" ? "Lunas" : pesanan ? "Menunggu" : "Belum dibuat"}
          </span>
        </div>

        {memuat ? (
          <p className="mt-6 text-[14px] text-tinta-2">Memeriksa kode terakhir...</p>
        ) : pesanan ? (
          <div className="mt-6">
            <div className="mx-auto w-full max-w-[360px] rounded-xl bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pesanan.qr}
                alt={`QRIS dinamis ${rupiah.format(pesanan.nominal)}`}
                width={360}
                height={360}
                className="h-auto w-full"
              />
            </div>
            <p className="mt-5 text-center font-mono text-[24px] font-medium tabular-nums text-tinta">
              {rupiah.format(pesanan.nominal)}
            </p>
            <p className="mt-2 text-center text-[13px] text-tinta-2">
              Pindai dengan GoPay atau aplikasi bank yang mendukung QRIS.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-garis-2 p-5">
            <p className="text-[14px] leading-relaxed text-tinta-2">
              Buat kode QRIS dinamis sebesar Rp1.000. Nominal terkunci di dalam kode, jadi pembeli tidak perlu mengetik jumlah.
            </p>
            <button type="button" className="tombol mt-5 w-full" onClick={buat} disabled={sibuk || perluKunci}>
              {sibuk ? "Membuat kode..." : "Buat QRIS Rp1.000"}
            </button>
          </div>
        )}

        {perluKunci && (
          <div className="mt-6 rounded-xl border border-tembaga/25 bg-tembaga/[0.06] p-4 text-[13px] leading-relaxed text-tinta-2">
            Alat masih terkunci. <a className="text-tinta underline" href="/gobiz">Buka dengan kunci admin di halaman GoBiz</a>.
          </div>
        )}
      </section>

      <section className="panel p-6 md:p-8" aria-labelledby="status-qris">
        <h2 id="status-qris" className="text-[16.5px] font-semibold tracking-[-0.02em]">
          Status uji pembayaran
        </h2>

        {pesanan ? (
          <dl className="mt-6 space-y-4">
            <div>
              <dt className="text-[13px] font-medium text-tinta-2">Nomor uji</dt>
              <dd className="mt-1 break-all font-mono text-[12.5px] text-tinta">{pesanan.id}</dd>
            </div>
            <div>
              <dt className="text-[13px] font-medium text-tinta-2">Dibuat</dt>
              <dd className="mt-1 text-[14px] text-tinta">{waktu(pesanan.dibuat)}</dd>
            </div>
            <div>
              <dt className="text-[13px] font-medium text-tinta-2">Batas pemeriksaan</dt>
              <dd className="mt-1 text-[14px] text-tinta">{waktu(pesanan.batasWaktu)}</dd>
            </div>
            {pesanan.transaksiId && (
              <div>
                <dt className="text-[13px] font-medium text-tinta-2">Transaksi terdeteksi</dt>
                <dd className="mt-1 break-all font-mono text-[12.5px] text-tinta">{pesanan.transaksiId}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="mt-6 text-[14px] leading-relaxed text-tinta-2">
            Belum ada kode uji. Setelah kode dibuat, halaman akan memeriksa riwayat merchant setiap 5 detik.
          </p>
        )}

        <div className="mt-6 rounded-xl border border-tembaga/25 bg-tembaga/[0.06] p-4 text-[13px] leading-relaxed text-tinta-2">
          Ini pembayaran sungguhan senilai Rp1.000 ke merchant GoPay. Halaman ini hanya alat uji dan tidak menerbitkan lisensi NaoVert.
        </div>

        {pesanan && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="tombol tombol-garis" onClick={() => periksa()} disabled={sibuk}>
              <Ikon nama="putar" ukuran={17} />
              {sibuk ? "Memeriksa..." : "Cek sekarang"}
            </button>
            <button type="button" className="tombol tombol-garis" onClick={buat} disabled={sibuk}>
              Buat kode baru
            </button>
            <button type="button" className="tombol tombol-garis" onClick={salinPayload}>
              Salin payload
            </button>
          </div>
        )}

        <p
          className={`mt-6 rounded-xl px-4 py-3 text-[13px] leading-relaxed ${
            pesan ? "bg-timbul text-tinta" : "sr-only"
          }`}
          role="status"
          aria-live="polite"
        >
          {pesan}
        </p>
      </section>
    </div>
  );
}
