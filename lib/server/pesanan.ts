import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { ambilTransaksi } from "@/lib/server/gobiz";
import { payloadStatis, qrisDinamis } from "@/lib/server/qris";
import { paket } from "@/lib/harga";

const FILE = path.join(process.cwd(), ".pesanan.json");
const MASA_BAYAR_MENIT = 30;
const JEDA_CEK_MS = 4_000;

export type StatusPesanan = "menunggu" | "lunas" | "kedaluwarsa";

export type Pesanan = {
  id: string;
  paket: string;
  paketNama: string;
  email: string;
  harga: number;
  nominal: number;
  payload: string;
  qr: string;
  dibuat: string;
  batasWaktu: string;
  status: StatusPesanan;
  transaksiId?: string;
  lunasPada?: string;
  terakhirCek?: string;
};

function galat(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

/* Satu antrean tulis supaya dua permintaan bersamaan tidak saling menimpa. */
let antrean: Promise<unknown> = Promise.resolve();

function berurutan<T>(kerja: () => Promise<T>): Promise<T> {
  const hasil = antrean.then(kerja, kerja);
  antrean = hasil.catch(() => undefined);
  return hasil;
}

async function bacaSemua(): Promise<Pesanan[]> {
  try {
    const isi = JSON.parse(await readFile(FILE, "utf8")) as Pesanan[];
    return Array.isArray(isi) ? isi : [];
  } catch {
    return [];
  }
}

async function simpanSemua(daftar: Pesanan[]) {
  await writeFile(FILE, JSON.stringify(daftar), { mode: 0o600 });
}

function kedaluwarsa(pesanan: Pesanan) {
  return Date.parse(pesanan.batasWaktu) <= Date.now();
}

function publik(pesanan: Pesanan): Pesanan {
  const { terakhirCek: _abaikan, ...sisa } = pesanan;
  if (pesanan.status === "menunggu" && kedaluwarsa(pesanan)) {
    return { ...sisa, status: "kedaluwarsa" };
  }
  return sisa;
}

export async function buatPesanan(input: { paket: string; email?: string }) {
  const dipilih = paket.find((item) => item.id === input.paket);
  if (!dipilih) throw galat(400, "Paket tidak dikenal.");

  const email = String(input.email || "").trim().slice(0, 160);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw galat(400, "Alamat email tidak valid.");
  }

  return berurutan(async () => {
    const semua = await bacaSemua();
    const aktif = semua.filter(
      (item) => item.status === "menunggu" && !kedaluwarsa(item),
    );
    if (aktif.length >= 60) {
      throw galat(429, "Terlalu banyak pesanan menunggu. Selesaikan atau tunggu pesanan lain kedaluwarsa.");
    }

    const terpakai = new Set(aktif.map((item) => item.nominal));
    let nominal = 0;
    for (let coba = 0; coba < 50; coba++) {
      const kandidat = dipilih.harga + 1 + Math.floor(Math.random() * 999);
      if (!terpakai.has(kandidat)) {
        nominal = kandidat;
        break;
      }
    }
    if (!nominal) throw galat(503, "Nominal unik sedang penuh. Coba lagi sebentar.");

    const payload = qrisDinamis(payloadStatis(), nominal);
    const qr = await QRCode.toDataURL(payload, {
      width: 420,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#1b1d20", light: "#ffffff" },
    });

    const dibuat = new Date();
    const pesanan: Pesanan = {
      id: `NVT-${dibuat.getTime().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`,
      paket: dipilih.id,
      paketNama: dipilih.nama,
      email,
      harga: dipilih.harga,
      nominal,
      payload,
      qr,
      dibuat: dibuat.toISOString(),
      batasWaktu: new Date(dibuat.getTime() + MASA_BAYAR_MENIT * 60_000).toISOString(),
      status: "menunggu",
    };

    semua.push(pesanan);
    await simpanSemua(semua);
    return publik(pesanan);
  });
}

export async function ambilPesanan(id: string) {
  const bersih = String(id || "").trim().toUpperCase();
  if (!/^NVT-[A-Z0-9-]{4,40}$/.test(bersih)) throw galat(400, "Nomor pesanan tidak valid.");

  return berurutan(async () => {
    const semua = await bacaSemua();
    const indeks = semua.findIndex((item) => item.id === bersih);
    if (indeks < 0) throw galat(404, "Pesanan tidak ditemukan.");
    const pesanan = semua[indeks];

    if (pesanan.status !== "menunggu") return publik(pesanan);
    if (kedaluwarsa(pesanan)) {
      semua[indeks] = { ...pesanan, status: "kedaluwarsa" };
      await simpanSemua(semua);
      return publik(semua[indeks]);
    }

    const terakhir = pesanan.terakhirCek ? Date.parse(pesanan.terakhirCek) : 0;
    if (Date.now() - terakhir < JEDA_CEK_MS) return publik(pesanan);

    let transaksi;
    try {
      transaksi = await ambilTransaksi(
        Math.min(1440, Math.ceil((Date.now() - Date.parse(pesanan.dibuat)) / 60_000) + 2),
      );
    } catch {
      /* GoBiz sedang tidak bisa dihubungi: status tetap menunggu. */
      return publik({ ...pesanan, terakhirCek: new Date().toISOString() });
    }

    const sejak = Date.parse(pesanan.dibuat) - 2 * 60_000;
    const cocok = transaksi.find((item) => {
      if (!["SETTLEMENT", "CAPTURE"].includes(item.status)) return false;
      if (item.nominal !== pesanan.nominal) return false;
      if (!item.waktu) return false;
      const waktu = Date.parse(item.waktu);
      return Number.isFinite(waktu) && waktu >= sejak;
    });

    const diperbarui: Pesanan = cocok
      ? {
          ...pesanan,
          status: "lunas",
          transaksiId: cocok.id || undefined,
          lunasPada: new Date().toISOString(),
          terakhirCek: new Date().toISOString(),
        }
      : { ...pesanan, terakhirCek: new Date().toISOString() };

    semua[indeks] = diperbarui;
    await simpanSemua(semua);
    return publik(diperbarui);
  });
}
