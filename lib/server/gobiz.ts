import { randomUUID } from "node:crypto";
import { readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const OTP_URL = "https://api.gobiz.co.id/goid/login/request";
const TOKEN_URL = "https://api.gobiz.co.id/goid/token";
const CONFIG_URL = "https://api.gobiz.co.id/goresto/v5/public/users/config";
const TRX_URL = "https://api.gojekapi.com/merchant-analytics/v2/merchants/transactions";
const SESSION_FILE = path.join(process.cwd(), ".gobiz-session.json");

export type SesiGoBiz = {
  phone_number: string;
  merchant_id: string | null;
  outlet_name: string;
  device_id: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: string;
};

export type TransaksiGoBiz = {
  id: string | null;
  waktu: string | null;
  status: string;
  nominal: number;
};

type Tantangan = {
  phone: string;
  otpToken: string;
  deviceId: string;
  expiresAt: number;
};

const tantangan = new Map<string, Tantangan>();

function galat(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

export function statusGalat(error: unknown) {
  if (error && typeof error === "object" && "status" in error) {
    const status = Number(error.status);
    if (status >= 400 && status <= 599) return status;
  }
  return 500;
}

export function pesanGalat(error: unknown) {
  if (error instanceof Error) return error.message;
  return "GoBiz tidak dapat dihubungi.";
}

export function normPhone(raw: string) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.startsWith("62")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

function baseHeaders(deviceId: string): Record<string, string> {
  return {
    accept: "application/json, text/plain, */*",
    "accept-language": "id",
    "authentication-type": "go-id",
    "content-type": "application/json",
    "gojek-country-code": "ID",
    "gojek-timezone": "Asia/Jakarta",
    origin: "https://portal.gofoodmerchant.co.id",
    referer: "https://portal.gofoodmerchant.co.id/",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    "x-appid": "go-biz-web-dashboard",
    "x-appversion": "platform-v3.111.0-1708bc9a",
    "x-deviceos": "Web",
    "x-phonemake": "Windows 10 64-bit",
    "x-phonemodel": "Chrome 150.0.0.0 on Windows 10 64-bit",
    "x-platform": "Web",
    "x-uniqueid": deviceId,
    "x-user-locale": "en-GB",
    "x-user-type": "merchant",
  };
}

async function jsonResponse(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export async function requestOtp(phoneRaw: string) {
  const phone = normPhone(phoneRaw);
  if (!/^8\d{7,13}$/.test(phone)) {
    throw galat(400, "Nomor HP tidak valid. Contoh: 08xxxxxxxxxx.");
  }

  const deviceId = randomUUID();
  const response = await fetch(OTP_URL, {
    method: "POST",
    headers: baseHeaders(deviceId),
    body: JSON.stringify({
      client_id: "go-biz-web-new",
      phone_number: phone,
      country_code: "62",
    }),
    signal: AbortSignal.timeout(20_000),
  });
  const payload = await jsonResponse(response);

  if (!response.ok) {
    if (response.status === 429) {
      throw galat(429, "GoBiz membatasi permintaan OTP. Tunggu beberapa menit.");
    }
    throw galat(502, "GoBiz menolak permintaan OTP. Periksa nomor merchant.");
  }

  const data = payload.data || payload;
  const otpToken = data.otp_token || data.login_token;
  if (!otpToken) throw galat(502, "Respons OTP GoBiz tidak dikenali.");

  return {
    phone,
    otpToken: String(otpToken),
    deviceId,
    expiresIn: Number(data.expires_in || 720),
  };
}

export async function verifyOtp(input: {
  phone: string;
  otp: string;
  otpToken: string;
  deviceId: string;
}) {
  const phone = normPhone(input.phone);
  if (!/^\d{4,8}$/.test(String(input.otp || ""))) {
    throw galat(400, "Kode OTP tidak valid.");
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: baseHeaders(input.deviceId),
    body: JSON.stringify({
      client_id: "go-biz-web-new",
      grant_type: "otp",
      data: { otp: String(input.otp), otp_token: input.otpToken },
    }),
    signal: AbortSignal.timeout(20_000),
  });
  const payload = await jsonResponse(response);

  if (!response.ok) {
    throw galat(
      response.status === 400 || response.status === 401 ? 401 : 502,
      response.status === 400 || response.status === 401
        ? "OTP salah atau kedaluwarsa. Minta OTP baru."
        : "GoBiz gagal memverifikasi OTP.",
    );
  }

  const token = payload.data || payload;
  if (!token.access_token) throw galat(502, "GoBiz tidak mengembalikan access token.");

  let merchantId: string | null = null;
  let outletName = "GoPay Merchant";
  try {
    const configResponse = await fetch(CONFIG_URL, {
      headers: {
        ...baseHeaders(input.deviceId),
        authorization: `Bearer ${token.access_token}`,
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (configResponse.ok) {
      const configPayload = await jsonResponse(configResponse);
      const data = configPayload.data || configPayload;
      const merchant = data.merchant || data.merchants?.[0] || data.restaurants?.[0];
      merchantId = merchant?.id ? String(merchant.id) : null;
      outletName = merchant?.name || merchant?.brand_name || outletName;
    }
  } catch {
    // Metadata outlet bersifat opsional; sesi tetap valid tanpa metadata ini.
  }

  const session: SesiGoBiz = {
    phone_number: `+62${phone}`,
    merchant_id: merchantId,
    outlet_name: outletName,
    device_id: input.deviceId,
    access_token: String(token.access_token),
    refresh_token: token.refresh_token ? String(token.refresh_token) : null,
    expires_at: new Date(Date.now() + Number(token.expires_in || 86_400) * 1000).toISOString(),
  };
  await simpanSesi(session);
  return session;
}

async function simpanSesi(session: SesiGoBiz) {
  await writeFile(SESSION_FILE, JSON.stringify(session), { mode: 0o600 });
}

export async function bacaSesi(): Promise<SesiGoBiz | null> {
  try {
    const session = JSON.parse(await readFile(SESSION_FILE, "utf8")) as SesiGoBiz;
    return session.access_token ? session : null;
  } catch {
    return null;
  }
}

export async function hapusSesi() {
  try {
    await unlink(SESSION_FILE);
  } catch {
    // Berkas mungkin belum ada.
  }
}

async function segarkanSesi() {
  const session = await bacaSesi();
  if (!session?.refresh_token) return null;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: baseHeaders(session.device_id),
    body: JSON.stringify({
      client_id: "go-biz-web-new",
      grant_type: "refresh_token",
      data: {
        refresh_token: session.refresh_token,
        phone_number: normPhone(session.phone_number),
        country_code: "62",
      },
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) return null;

  const payload = await jsonResponse(response);
  const token = payload.data || payload;
  if (!token.access_token) return null;

  const refreshed: SesiGoBiz = {
    ...session,
    access_token: String(token.access_token),
    refresh_token: token.refresh_token ? String(token.refresh_token) : session.refresh_token,
    expires_at: new Date(Date.now() + Number(token.expires_in || 86_400) * 1000).toISOString(),
  };
  await simpanSesi(refreshed);
  return refreshed;
}

export async function ambilTransaksi(menit = 90, sudahRefresh = false): Promise<TransaksiGoBiz[]> {
  const session = await bacaSesi();
  if (!session) throw galat(401, "Sesi GoBiz belum ada. Login lewat halaman GoBiz dulu.");

  const now = new Date();
  const params = new URLSearchParams({
    from: "0",
    size: "50",
    statuses: "SETTLEMENT,CAPTURE,REFUND,PARTIAL_REFUND",
    payment_types: "QRIS,GOPAY,OFFLINE_CREDIT_CARD,OFFLINE_DEBIT_CARD,CREDIT_CARD",
    start_time: new Date(now.getTime() - menit * 60_000).toISOString(),
    end_time: new Date(now.getTime() + 2 * 60_000).toISOString(),
    merchant_ids: session.merchant_id || "",
  });

  const response = await fetch(`${TRX_URL}?${params}`, {
    headers: {
      ...baseHeaders(session.device_id),
      authorization: `Bearer ${session.access_token}`,
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (response.status === 401 && !sudahRefresh) {
    const refreshed = await segarkanSesi();
    if (refreshed) return ambilTransaksi(menit, true);
  }
  if (!response.ok) throw galat(502, `GoBiz gagal membaca transaksi (HTTP ${response.status}).`);

  const payload = await jsonResponse(response);
  const data = payload.data || payload;
  const list = data.transactions || data.data || data.items || [];
  if (!Array.isArray(list)) return [];

  return list.map((item: Record<string, unknown>) => {
    const amount = item.amount;
    const raw =
      item.gross_amount ??
      item.real_gross_amount ??
      (typeof amount === "object" && amount !== null
        ? (amount as Record<string, unknown>).value
        : amount);
    const number = Number(String(raw ?? "").replace(/[^0-9]/g, "")) || 0;
    return {
      id: item.id || item.transaction_id || item.reference_id
        ? String(item.id || item.transaction_id || item.reference_id)
        : null,
      waktu: item.transaction_time || item.settlement_time || item.created_at
        ? String(item.transaction_time || item.settlement_time || item.created_at)
        : null,
      status: String(item.transaction_status || item.status || item.payment_status || "").toUpperCase(),
      nominal: Math.round(number / 100),
    };
  });
}

export function simpanTantangan(input: Omit<Tantangan, "expiresAt">, expiresIn: number) {
  const now = Date.now();
  for (const [id, value] of tantangan) {
    if (value.expiresAt <= now) tantangan.delete(id);
  }
  const id = randomUUID();
  tantangan.set(id, { ...input, expiresAt: now + Math.min(expiresIn, 600) * 1000 });
  return id;
}

export function ambilTantangan(id: string) {
  const value = tantangan.get(id);
  if (!value) return null;
  if (value.expiresAt <= Date.now()) {
    tantangan.delete(id);
    return null;
  }
  return value;
}

export function hapusTantangan(id: string) {
  tantangan.delete(id);
}
