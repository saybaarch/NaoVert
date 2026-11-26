/**
 * Uji gerak di peramban sungguhan.
 *
 * Yang diperiksa adalah hal hal yang tidak akan terlihat dari build yang
 * hijau: apakah angka benar benar naik dari nol, apakah baris judul masuk
 * berurutan, apakah kanvas tiga dimensi melukis, dan apakah tanda tetap
 * terbaca sepanjang ayunannya.
 *
 *   node alat/uji-gerak.js
 */
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const ALAMAT = process.env.UJI_URL || "http://localhost:3001";
const AKAR = path.resolve(__dirname, "..");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const KELUAR = path.join(AKAR, "alat", "video", "_cek");

const jeda = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(KELUAR, { recursive: true });

  const peramban = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--enable-unsafe-swiftshader",
      "--use-gl=angle",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
    ],
  });

  const halaman = await peramban.newPage();
  await halaman.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  const galat = [];
  halaman.on("pageerror", (e) => galat.push(e.message));
  halaman.on("console", (m) => {
    if (m.type() === "error") galat.push("konsol: " + m.text());
  });

  await halaman.goto(ALAMAT, { waitUntil: "networkidle2", timeout: 60000 });

  const laporan = {};

  /* 1. Angka benar benar naik: gulir ke bagiannya dulu, lalu baca tiga kali.
        Tanpa digulir, angka di bawah layar memang masih nol karena geraknya
        menunggu bagian itu terlihat. */
  await halaman.evaluate(() => window.scrollTo(0, 700));
  await jeda(150);

  const bacaAngka = () =>
    halaman.evaluate(() =>
      [...document.querySelectorAll(".hitung-angka")].map((e) =>
        e.textContent.trim(),
      ),
    );

  const angkaAwal = await bacaAngka();
  await jeda(400);
  const angkaTengah = await bacaAngka();
  await jeda(1500);
  const angkaAkhir = await bacaAngka();

  laporan.angka = {
    awal: angkaAwal,
    tengah: angkaTengah,
    akhir: angkaAkhir,
    // Nol lalu naik lalu berhenti pada nilai penuh.
    bergerak: angkaAwal.join() !== angkaAkhir.join(),
    nilaiBenar: await halaman.evaluate(() =>
      [...document.querySelectorAll(".hitung-angka")].map((e) =>
        e.getAttribute("aria-label"),
      ),
    ),
  };

  /* 2. Baris judul masuk berurutan, bukan sekaligus. */
  laporan.judul = await halaman.evaluate(() =>
    [...document.querySelectorAll(".baris-judul")].map((e) => ({
      teks: e.textContent.trim().slice(0, 24),
      tampil: e.classList.contains("baris-judul-tampil"),
      tunda: getComputedStyle(e).transitionDelay,
    })),
  );

  /* 3. Kanvas melukis. Diukur dari tangkapan layar elemennya, bukan
        readPixels, karena penyangga gambar dibersihkan setelah digambar. */
  const kanvas = await halaman.$("canvas");
  const potret = [];
  for (let i = 0; i < 4; i++) {
    const buf = await kanvas.screenshot({ encoding: "base64" });
    potret.push(buf);
    await jeda(900);
  }
  laporan.kanvas = {
    potretBerbeda: new Set(potret).size,
    // Empat potret pada waktu berbeda harus menghasilkan gambar berbeda,
    // artinya bendanya benar benar bergerak.
    bergerak: new Set(potret).size > 2,
  };

  /* 4. Label bagian memanjang saat terlihat. */
  await halaman.evaluate(() => {
    const l = document.querySelector(".label-garis");
    l?.scrollIntoView({ block: "center" });
  });
  await jeda(900);
  laporan.label = await halaman.evaluate(() => {
    const l = document.querySelector(".label-garis");
    if (!l) return null;
    const g = getComputedStyle(l, "::before");
    return {
      lebar: g.width,
      tampil: l.classList.contains("label-garis-tampil"),
    };
  });

  /* 5. Kursor memiringkan kartu galeri (hanya di perangkat berkursor). */
  await halaman.evaluate(() => {
    document.querySelector(".miring-kursor")?.scrollIntoView({ block: "center" });
  });
  await jeda(800);
  const kartu = await halaman.$(".miring-kursor");
  if (kartu) {
    const k = await kartu.boundingBox();
    await halaman.mouse.move(k.x + k.width * 0.85, k.y + k.height * 0.2);
    await jeda(420);
    laporan.miring = await halaman.evaluate(() => {
      const el = document.querySelector(".miring-kursor");
      return {
        mx: el.style.getPropertyValue("--mx"),
        my: el.style.getPropertyValue("--my"),
        transform: getComputedStyle(el).transform.slice(0, 40),
      };
    });
  } else {
    laporan.miring = null;
  }

  /* 6. Tangkapan layar penuh untuk diperiksa sendiri. */
  await halaman.evaluate(() => window.scrollTo(0, 0));
  await jeda(600);
  await halaman.screenshot({ path: path.join(KELUAR, "gerak-atas.png") });
  await halaman.screenshot({
    path: path.join(KELUAR, "gerak-penuh.png"),
    fullPage: true,
  });

  laporan.galat = galat;
  console.log(JSON.stringify(laporan, null, 2));

  await peramban.close();
  process.exit(galat.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(2);
});
