"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import Ikon from "@/components/ikon";
import { paket, rupiah } from "@/lib/harga";

type Settings = {
  auth_mode: string;
  client_id: string;
  otp_endpoint: string;
  token_endpoint: string;
  config_endpoint: string;
  transactions_endpoint: string;
  local_only: boolean;
  qris_payload_configured: boolean;
  qris_test_amount: number;
  checkout_active: boolean;
};

type Status = {
  connected: boolean;
  phone?: string;
  outlet?: string;
  merchant_id?: string | null;
  expires_at?: string;
  settings?: Settings;
};

type Transaksi = {
  id: string | null;
  waktu: string | null;
  status: string;
  nominal: number;
};

const inputClass =
  "h-12 w-full rounded-xl border border-garis-2 bg-latar px-3.5 text-[16px] text-tinta outline-none transition-colors placeholder:text-tinta-3 focus:border-tembaga";
const labelClass = "mb-2 block text-[13px] font-medium text-tinta-2";
const valueClass = "break-all font-mono text-[12.5px] leading-relaxed text-tinta";

async function panggil<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/gobiz${path}`, {
    credentials: "same-origin",
    ...options,
    headers: { "content-type": "application/json", ...(options?.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
  return data as T;
}

function formatWaktu(value: string | null | undefined) {
  if (!value) return "Tidak tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function maskPhone(value?: string) {
  if (!value) return "Tidak tersedia";
  const digits = value.replace(/\D/g, "");
  if (digits.length < 5) return "••••";
  return `${digits.slice(0, 2)}••••••${digits.slice(-3)}`;
}

function maskId(value?: string | null) {
  if (!value) return "Tidak tersedia";
  if (value.length <= 10) return `${value.slice(0, 2)}••••${value.slice(-2)}`;
  return `${value.slice(0, 8)}••••${value.slice(-4)}`;
}

function BarisPengaturan({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-garis py-4 last:border-b-0">
      <dt className="text-[12px] font-medium text-tinta-3">{label}</dt>
      <dd className={valueClass}>{value}</dd>
    </div>
  );
}

export default function GobizLocal() {
  const [terbuka, setTerbuka] = useState(false);
  const [memuat, setMemuat] = useState(true);
  const [kunci, setKunci] = useState("");
  const [phone, setPhone] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<Status>({ connected: false });
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [pesan, setPesan] = useState("");
  const [jenis, setJenis] = useState<"ok" | "err">("err");
  const [sibuk, setSibuk] = useState("");

  function beriPesan(text: string, kind: "ok" | "err" = "err") {
    setPesan(text);
    setJenis(kind);
  }

  async function muatStatus() {
    try {
      const data = await panggil<Status>("/status");
      setStatus(data);
      setTerbuka(true);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Status tidak bisa dimuat.";
      if (/kunci|401/i.test(message)) {
        setTerbuka(false);
      } else {
        beriPesan(message);
      }
      return null;
    }
  }

  async function muatTransaksi() {
    setSibuk("transaksi");
    try {
      const data = await panggil<{ transactions: Transaksi[] }>("/transactions?minutes=120");
      setTransaksi(data.transactions);
      if (!data.transactions.length) beriPesan("Tidak ada transaksi dalam 120 menit terakhir.", "ok");
    } catch (error) {
      beriPesan(error instanceof Error ? error.message : "Transaksi tidak bisa dimuat.");
    } finally {
      setSibuk("");
    }
  }

  useEffect(() => {
    muatStatus().finally(() => setMemuat(false));
  }, []);

  async function buka(event: FormEvent) {
    event.preventDefault();
    setSibuk("unlock");
    try {
      await panggil("/unlock", { method: "POST", body: JSON.stringify({ key: kunci }) });
      setKunci("");
      setTerbuka(true);
      beriPesan("Kunci admin diterima.", "ok");
      await muatStatus();
    } catch (error) {
      beriPesan(error instanceof Error ? error.message : "Kunci admin tidak bisa dibuka.");
    } finally {
      setSibuk("");
    }
  }

  async function kirimOtp(event: FormEvent) {
    event.preventDefault();
    setSibuk("otp");
    try {
      const data = await panggil<{ challengeId: string; phone: string; expiresIn: number }>(
        "/request-otp",
        { method: "POST", body: JSON.stringify({ phone }) },
      );
      setChallengeId(data.challengeId);
      setOtp("");
      beriPesan(`OTP dikirim ke ${maskPhone(data.phone)}. Berlaku sekitar ${Math.ceil(data.expiresIn / 60)} menit.`, "ok");
    } catch (error) {
      beriPesan(error instanceof Error ? error.message : "OTP tidak bisa dikirim.");
    } finally {
      setSibuk("");
    }
  }

  async function verifikasiOtp(event: FormEvent) {
    event.preventDefault();
    setSibuk("verify");
    try {
      const data = await panggil<Status>("/verify-otp", {
        method: "POST",
        body: JSON.stringify({ challengeId, otp }),
      });
      setStatus((sebelumnya) => ({ ...sebelumnya, ...data }));
      setChallengeId("");
      setOtp("");
      beriPesan("Sesi merchant tersimpan di server lokal.", "ok");
      await muatTransaksi();
    } catch (error) {
      beriPesan(error instanceof Error ? error.message : "OTP tidak bisa diverifikasi.");
    } finally {
      setSibuk("");
    }
  }

  async function putuskan() {
    if (!window.confirm("Hapus sesi GoBiz dari server lokal?")) return;
    setSibuk("session");
    try {
      await panggil("/session", { method: "DELETE" });
      setStatus((sebelumnya) => ({ connected: false, settings: sebelumnya.settings }));
      setTransaksi([]);
      setChallengeId("");
      beriPesan("Sesi GoBiz dihapus.", "ok");
    } catch (error) {
      beriPesan(error instanceof Error ? error.message : "Sesi tidak bisa dihapus.");
    } finally {
      setSibuk("");
    }
  }

  const settings = status.settings;
  const statusQris = !terbuka
    ? "Perlu kunci admin"
    : settings?.qris_payload_configured
      ? "Siap untuk uji"
      : "Payload belum diatur";

  return (
    <div className="space-y-6">
      <section className="panel p-6 md:p-8" aria-labelledby="ringkasan-admin">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label">Panel admin</p>
            <h2 id="ringkasan-admin" className="mt-2 text-[22px] font-semibold tracking-[-0.03em]">
              Ringkasan pembayaran
            </h2>
            <p className="mt-2 text-[13.5px] text-tinta-2">
              Konfigurasi aman tanpa access token, refresh token, atau OTP token.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/harga" className="tombol tombol-garis">
              Harga publik
            </Link>
            <Link href="/gobiz/qris" className="tombol">
              Uji QRIS Rp1.000
              <Ikon nama="panah" ukuran={16} />
            </Link>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-garis bg-latar p-4">
            <p className="text-[11.5px] font-medium text-tinta-3">Merchant</p>
            <p className="mt-2 text-[14px] font-semibold">
              {memuat ? "Memeriksa..." : status.connected ? "Terhubung" : "Belum terhubung"}
            </p>
            <p className="mt-1 truncate text-[12px] text-tinta-3">{status.outlet || "GoPay Merchant"}</p>
          </div>
          <div className="rounded-xl border border-garis bg-latar p-4">
            <p className="text-[11.5px] font-medium text-tinta-3">QRIS statis</p>
            <p className="mt-2 text-[14px] font-semibold">{statusQris}</p>
            <p className="mt-1 text-[12px] text-tinta-3">
              Uji dinamis {rupiah.format(settings?.qris_test_amount || 1000)}
            </p>
          </div>
          <div className="rounded-xl border border-garis bg-latar p-4">
            <p className="text-[11.5px] font-medium text-tinta-3">Akses alat</p>
            <p className="mt-2 text-[14px] font-semibold">
              {settings?.local_only === false ? "Remote diizinkan" : "Localhost saja"}
            </p>
            <p className="mt-1 text-[12px] text-tinta-3">Cookie admin HttpOnly</p>
          </div>
          <div className="rounded-xl border border-garis bg-latar p-4">
            <p className="text-[11.5px] font-medium text-tinta-3">Checkout produk</p>
            <p className="mt-2 text-[14px] font-semibold">
              {settings?.checkout_active ? "Aktif" : "Belum aktif"}
            </p>
            <p className="mt-1 text-[12px] text-tinta-3">Lisensi belum diterbitkan otomatis</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-6 md:p-8" aria-labelledby="status-gobiz">
          <div className="flex items-center justify-between gap-4">
            <h2 id="status-gobiz" className="text-[17px] font-semibold tracking-[-0.02em]">
              Status koneksi
            </h2>
            <span
              className={`inline-flex min-h-9 items-center rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.07em] ${
                status.connected ? "bg-tembaga text-di-atas-tembaga" : "bg-timbul text-tinta-2"
              }`}
            >
              {status.connected ? "Terhubung" : "Belum masuk"}
            </span>
          </div>

          {memuat ? (
            <p className="mt-6 text-[14px] text-tinta-2">Memeriksa sesi lokal...</p>
          ) : status.connected ? (
            <dl className="mt-6 space-y-4">
              <div>
                <dt className={labelClass}>Outlet</dt>
                <dd className="text-[15px] font-medium text-tinta">{status.outlet || "GoPay Merchant"}</dd>
              </div>
              <div>
                <dt className={labelClass}>Nomor merchant</dt>
                <dd className="font-mono text-[14px] text-tinta">{maskPhone(status.phone)}</dd>
              </div>
              <div>
                <dt className={labelClass}>Merchant ID</dt>
                <dd className="break-all font-mono text-[13px] text-tinta-2">{maskId(status.merchant_id)}</dd>
              </div>
              <div>
                <dt className={labelClass}>Sesi berlaku sampai</dt>
                <dd className="text-[14px] text-tinta-2">{formatWaktu(status.expires_at)}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-6 text-[14px] leading-relaxed text-tinta-2">
              Belum ada sesi merchant yang tersimpan. Masukkan kunci admin, lalu login dengan nomor GoPay merchant terdaftar.
            </p>
          )}

          <div className="mt-7 rounded-xl border border-tembaga/25 bg-tembaga/[0.06] p-4 text-[12.5px] leading-relaxed text-tinta-2">
            Alat ini memakai endpoint internal GoBiz yang sama dengan NexShop. Endpoint tersebut dapat berubah dan hanya boleh dipakai untuk uji coba lokal.
          </div>

          {terbuka && (
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" className="tombol tombol-garis" onClick={muatStatus} disabled={Boolean(sibuk)}>
                <Ikon nama="putar" ukuran={16} />
                Cek ulang status
              </button>
              <button type="button" className="tombol tombol-garis" onClick={muatTransaksi} disabled={!status.connected || Boolean(sibuk)}>
                <Ikon nama="putar" ukuran={16} />
                Cek transaksi
              </button>
              {status.connected && (
                <button type="button" className="tombol tombol-garis" onClick={putuskan} disabled={Boolean(sibuk)}>
                  <Ikon nama="tutup" ukuran={16} />
                  Hapus sesi
                </button>
              )}
            </div>
          )}
        </section>

        <section className="panel p-6 md:p-8" aria-labelledby="login-gobiz">
          <h2 id="login-gobiz" className="text-[17px] font-semibold tracking-[-0.02em]">
            Login merchant
          </h2>

          {memuat ? (
            <p className="mt-6 text-[14px] text-tinta-2" role="status">
              Memeriksa akses admin...
            </p>
          ) : !terbuka ? (
            <form className="mt-6" onSubmit={buka}>
              <label htmlFor="gobiz-key" className={labelClass}>Kunci admin lokal</label>
              <input
                id="gobiz-key"
                type="password"
                className={inputClass}
                value={kunci}
                onChange={(event) => setKunci(event.target.value)}
                autoComplete="off"
                required
              />
              <p className="mt-2 text-[12.5px] leading-relaxed text-tinta-3">
                Isi variabel GOBIZ_ADMIN_KEY di server, lalu masukkan nilai yang sama di sini.
              </p>
              <button type="submit" className="tombol mt-5 w-full" disabled={Boolean(sibuk)}>
                {sibuk === "unlock" ? "Membuka..." : "Buka panel admin"}
              </button>
            </form>
          ) : (
            <div className="mt-6 space-y-7">
              <form onSubmit={kirimOtp}>
                <label htmlFor="gobiz-phone" className={labelClass}>Nomor HP merchant terdaftar</label>
                <input
                  id="gobiz-phone"
                  type="tel"
                  inputMode="tel"
                  className={inputClass}
                  placeholder="08xxxxxxxxxx"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                  required
                />
                <button type="submit" className="tombol mt-4 w-full" disabled={Boolean(sibuk)}>
                  {sibuk === "otp" ? "Mengirim OTP..." : "Kirim OTP"}
                </button>
              </form>

              {challengeId && (
                <form onSubmit={verifikasiOtp} className="border-t border-garis pt-6">
                  <label htmlFor="gobiz-otp" className={labelClass}>Kode OTP</label>
                  <input
                    id="gobiz-otp"
                    type="text"
                    inputMode="numeric"
                    className={inputClass}
                    placeholder="Kode dari SMS"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                    autoComplete="one-time-code"
                    required
                  />
                  <button type="submit" className="tombol mt-4 w-full" disabled={Boolean(sibuk)}>
                    {sibuk === "verify" ? "Memverifikasi..." : "Verifikasi dan simpan sesi"}
                  </button>
                </form>
              )}
            </div>
          )}

          <p
            className={`mt-6 rounded-xl px-4 py-3 text-[13px] leading-relaxed ${
              pesan ? (jenis === "ok" ? "bg-timbul text-tinta" : "bg-tembaga/[0.09] text-tinta") : "sr-only"
            }`}
            role="status"
            aria-live="polite"
          >
            {pesan}
          </p>
        </section>
      </div>

      <section className="panel p-6 md:p-8" aria-labelledby="pengaturan-gobiz">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label">Konfigurasi</p>
            <h2 id="pengaturan-gobiz" className="mt-2 text-[20px] font-semibold tracking-[-0.025em]">
              Pengaturan API GoBiz
            </h2>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-tinta-2">
              Nilai di bawah bersifat informatif dan tidak memuat rahasia. Perubahan kunci atau payload dilakukan di environment server, lalu server dimulai ulang.
            </p>
          </div>
          <span className="chip chip-aksen">Read-only</span>
        </div>

        {terbuka && settings ? (
          <dl className="mt-6 grid gap-x-8 md:grid-cols-2">
            <BarisPengaturan label="Mode autentikasi" value={settings.auth_mode} />
            <BarisPengaturan label="Client ID" value={settings.client_id} />
            <BarisPengaturan label="Endpoint OTP" value={settings.otp_endpoint} />
            <BarisPengaturan label="Endpoint token" value={settings.token_endpoint} />
            <BarisPengaturan label="Endpoint konfigurasi" value={settings.config_endpoint} />
            <BarisPengaturan label="Endpoint transaksi" value={settings.transactions_endpoint} />
            <BarisPengaturan label="Pembatasan akses" value={settings.local_only ? "Localhost only" : "Remote diizinkan"} />
            <BarisPengaturan label="Nominal uji QRIS" value={rupiah.format(settings.qris_test_amount)} />
          </dl>
        ) : (
          <p className="mt-6 rounded-xl border border-garis bg-latar p-5 text-[13.5px] text-tinta-2">
            Buka panel dengan kunci admin untuk melihat konfigurasi API yang aktif.
          </p>
        )}

        <div className="mt-5 grid gap-3 text-[12.5px] leading-relaxed text-tinta-2 sm:grid-cols-2">
          <p className="rounded-xl bg-timbul p-4">
            <b className="text-tinta">Environment yang dibaca:</b> GOBIZ_ADMIN_KEY, GOBIZ_ALLOW_REMOTE, dan QRIS_PAYLOAD.
          </p>
          <p className="rounded-xl bg-timbul p-4">
            <b className="text-tinta">Direct Integration:</b> kredensial OAuth di .env.example belum dipakai oleh alur OTP merchant ini.
          </p>
        </div>
      </section>

      <section className="panel p-6 md:p-8" aria-labelledby="harga-admin">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="label">Produk</p>
            <h2 id="harga-admin" className="mt-2 text-[20px] font-semibold tracking-[-0.025em]">
              Harga yang tampil di situs
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {paket.map((item) => (
                <div key={item.id} className="rounded-xl border border-garis bg-latar p-5">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-tembaga-teks">{item.nama}</p>
                  <p className="mt-3 text-[24px] font-bold tracking-[-0.035em] tabular-nums">
                    {rupiah.format(item.harga)}
                  </p>
                  {item.hargaAsli > item.harga && (
                    <p className="mt-1 text-[12px] text-tinta-3">
                      Harga asli <del>{rupiah.format(item.hargaAsli)}</del>
                    </p>
                  )}
                  <p className="mt-3 text-[12px] text-tinta-3">{item.durasi}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="label">Alur pembayaran</p>
            <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.025em]">Yang perlu diperiksa</h2>
            <ol className="mt-5 space-y-3">
              {[
                "Hubungkan merchant lewat nomor GoPay terdaftar dan OTP.",
                "Pastikan QRIS_PAYLOAD terisi dan CRC payload valid.",
                "Uji QRIS dinamis Rp1.000, lalu cocokkan status transaksi merchant.",
                "Aktifkan checkout produk hanya setelah penerbitan lisensi siap.",
              ].map((isi, i) => (
                <li key={isi} className="flex gap-3 rounded-xl bg-timbul p-4 text-[13px] leading-relaxed text-tinta-2">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tembaga text-[10px] font-bold text-di-atas-tembaga">
                    {i + 1}
                  </span>
                  {isi}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {status.connected && (
        <section className="panel p-6 md:p-8" aria-labelledby="transaksi-gobiz">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="transaksi-gobiz" className="text-[18px] font-semibold tracking-[-0.02em]">Transaksi terakhir</h2>
              <p className="mt-1 text-[13px] text-tinta-3">120 menit terakhir, waktu Jakarta.</p>
            </div>
            <button type="button" className="tombol tombol-garis" onClick={muatTransaksi} disabled={Boolean(sibuk)}>
              <Ikon nama="putar" ukuran={16} />
              {sibuk === "transaksi" ? "Memuat..." : "Muat ulang"}
            </button>
          </div>

          {transaksi.length ? (
            <ul className="mt-6 divide-y divide-garis border-y border-garis">
              {transaksi.map((item, index) => (
                <li key={`${item.id || "tanpa-id"}-${index}`} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-mono text-[13px] font-medium text-tinta">{item.status || "STATUS TIDAK DIKENAL"}</p>
                    <p className="mt-1 text-[12.5px] text-tinta-3">{formatWaktu(item.waktu)}</p>
                    {item.id && <p className="mt-1 break-all font-mono text-[11.5px] text-tinta-3">{maskId(item.id)}</p>}
                  </div>
                  <p className="font-mono text-[15px] font-medium tabular-nums text-tinta">{rupiah.format(item.nominal)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-[14px] text-tinta-2">Belum ada transaksi yang dimuat.</p>
          )}
        </section>
      )}
    </div>
  );
}
