import { randomUUID } from "node:crypto";
import { readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { ambilTransaksi } from "@/lib/server/gobiz";

const SESSION_FILE = path.join(process.cwd(), ".qris-test.json");
export const NOMINAL_UJI = 1000;

type Tag = { id: string; value: string };

type PesananUji = {
  id: string;
  nominal: number;
  payload: string;
  qr: string;
  dibuat: string;
  batasWaktu: string;
  status: "menunggu" | "lunas";
  transaksiId?: string;
};

function galat(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function crc16(value: string) {
  let crc = 0xffff;
  for (let i = 0; i < value.length; i++) {
    crc ^= value.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff);
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function parseTlv(payload: string): Tag[] {
  const tags: Tag[] = [];
  let offset = 0;
  while (offset + 4 <= payload.length) {
    const id = payload.slice(offset, offset + 2);
    const length = Number(payload.slice(offset + 2, offset + 4));
    if (!/^\d{2}$/.test(id) || !Number.isInteger(length)) break;
    const value = payload.slice(offset + 4, offset + 4 + length);
    if (value.length !== length) break;
    tags.push({ id, value });
    offset += 4 + length;
  }
  return tags;
}

function buildTlv(tags: Tag[]) {
  return tags.map((tag) => `${tag.id}${String(tag.value.length).padStart(2, "0")}${tag.value}`).join("");
}

function validasiQris(payload: string) {
  const clean = String(payload || "").trim();
  if (!clean.startsWith("000201")) throw galat(503, "Payload QRIS lokal belum valid.");
  const crcIndex = clean.lastIndexOf("6304");
  if (crcIndex < 0 || clean.length !== crcIndex + 8) {
    throw galat(503, "Payload QRIS lokal tidak memiliki CRC yang lengkap.");
  }
  const body = clean.slice(0, crcIndex + 4);
  if (crc16(body) !== clean.slice(crcIndex + 4).toUpperCase()) {
    throw galat(503, "CRC payload QRIS lokal tidak cocok.");
  }
  const tags = parseTlv(clean.slice(0, crcIndex));
  if (!tags.some((tag) => tag.id === "59") || !tags.some((tag) => tag.id === "58")) {
    throw galat(503, "Payload QRIS lokal bukan format merchant yang dikenali.");
  }
  return { clean, tags };
}

export function qrisDinamis(payloadStatis: string, nominal: number) {
  const { tags } = validasiQris(payloadStatis);
  const tanpaNominal = tags.filter((tag) => tag.id !== "54" && tag.id !== "63");
  const hasil: Tag[] = [];
  let disisipkan = false;
  for (const tag of tanpaNominal) {
    if (!disisipkan && Number(tag.id) > 54) {
      hasil.push({ id: "54", value: String(nominal) });
      disisipkan = true;
    }
    hasil.push(tag);
  }
  if (!disisipkan) hasil.push({ id: "54", value: String(nominal) });
  const body = buildTlv(hasil) + "6304";
  return body + crc16(body);
}

export function payloadStatis() {
  const payload = process.env.QRIS_PAYLOAD || "";
  if (!payload) throw galat(503, "QRIS_PAYLOAD belum diatur di server lokal.");
  return payload;
}

async function bacaPesanan(): Promise<PesananUji | null> {
  try {
    const value = JSON.parse(await readFile(SESSION_FILE, "utf8")) as PesananUji;
    return value.id && value.payload ? value : null;
  } catch {
    return null;
  }
}

export async function buatQrisUji() {
  const id = `NVT-QRIS-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`;
  const payload = qrisDinamis(payloadStatis(), NOMINAL_UJI);
  const dibuat = new Date();
  const qr = await QRCode.toDataURL(payload, {
    width: 360,
    margin: 3,
    errorCorrectionLevel: "M",
    color: { dark: "#1b1d20", light: "#ffffff" },
  });
  const pesanan: PesananUji = {
    id,
    nominal: NOMINAL_UJI,
    payload,
    qr,
    dibuat: dibuat.toISOString(),
    batasWaktu: new Date(dibuat.getTime() + 15 * 60_000).toISOString(),
    status: "menunggu",
  };
  await writeFile(SESSION_FILE, JSON.stringify(pesanan), { mode: 0o600 });
  return pesanan;
}

export async function statusQrisUji() {
  const pesanan = await bacaPesanan();
  if (!pesanan) return null;
  if (pesanan.status === "lunas") return pesanan;

  const menit = Math.min(1440, Math.max(5, Math.ceil((Date.now() - Date.parse(pesanan.dibuat)) / 60_000) + 1));
  const transaksi = await ambilTransaksi(menit);
  const sejak = Date.parse(pesanan.dibuat) - 2 * 60_000;
  const cocok = transaksi.find((item) => {
    if (!["SETTLEMENT", "CAPTURE"].includes(item.status) || item.nominal !== pesanan.nominal) return false;
    if (!item.waktu) return false;
    const waktu = Date.parse(item.waktu);
    return Number.isFinite(waktu) && waktu >= sejak;
  });

  if (cocok) {
    pesanan.status = "lunas";
    pesanan.transaksiId = cocok.id || undefined;
    await writeFile(SESSION_FILE, JSON.stringify(pesanan), { mode: 0o600 });
  }
  return pesanan;
}

export async function hapusQrisUji() {
  try {
    await unlink(SESSION_FILE);
  } catch {
    // Berkas mungkin belum ada.
  }
}
