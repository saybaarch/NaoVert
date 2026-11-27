/**
 * Uji beranda di peramban sungguhan.
 *
 * Yang diperiksa bukan hanya halaman menjawab 200, tetapi hal hal yang bisa
 * diam diam gagal: kanvas tiga dimensi yang tidak melukis apa pun, pengalih
 * tema yang tidak mengubah warna, poster video yang tidak termuat, dan galat
 * JavaScript di konsol.
 *
 * Memakai puppeteer-core + Chrome yang terpasang, sama seperti alat tangkap
 * UI, supaya tidak ada peramban kedua yang perlu diunduh.
 *
 *   node alat/uji-beranda.js
 */
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const ALAMAT = process.env.UJI_URL || "http://localhost:3001";
const AKAR = path.resolve(__dirname, "..");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const KELUAR = path.join(AKAR, ".uji");  // foto uji, diabaikan git

(async () => {
  fs.mkdirSync(KELUAR, { recursive: true });

  const peramban = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      // Peramban tanpa layar memakai SwiftShader untuk WebGL. Tanpa ini
      // kanvas bisa kosong bukan karena kode salah, tetapi karena tidak ada
      // GPU, dan hasil ujinya jadi menyesatkan.
      "--enable-unsafe-swiftshader",
      "--use-gl=angle",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
    ],
  });

  const halaman = await peramban.newPage();
  await halaman.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const galat = [];
  halaman.on("console", (m) => {
    if (m.type() === "error") galat.push("konsol: " + m.text());
  });
  halaman.on("pageerror", (e) => galat.push("halaman: " + e.message));
  halaman.on("requestfailed", (r) =>
    galat.push("gagal muat: " + r.url().replace(ALAMAT, "") + " " + r.failure()?.errorText),
  );

  await halaman.goto(ALAMAT, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));

  const laporan = {};

  /* 1. Kanvas tiga dimensi punya konteks dan ukuran yang benar.
     *
     * Isi pikselnya sengaja TIDAK diperiksa di sini. gl.readPixels setelah
     * bingkai dikomposisikan selalu mengembalikan nol karena konteksnya tidak
     * memakai preserveDrawingBuffer, sehingga laporan lama berbunyi "0 piksel
     * berwarna" padahal tandanya tergambar. Pemeriksaan isi ada di
     * alat/uji-tanda3d.js, yang memotret elemennya dan membandingkan dua
     * tangkapan untuk memastikan tandanya bergerak. */
    laporan.kanvas = await halaman.evaluate(() => {
      const c = document.querySelector("canvas");
      if (!c) return { ada: false };
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      return {
        ada: true,
        lebar: c.width,
        tinggi: c.height,
        konteks: gl ? gl.getParameter(gl.VERSION) : null,
        tampil: c.getBoundingClientRect().width > 100,
      };
    });

  /* 2. Pengalih tema benar benar mengubah warna latar. */
  const ambilLatar = () =>
    halaman.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const latarGelap = await ambilLatar();
  await halaman.click('button[aria-label*="tema"]');
  await new Promise((r) => setTimeout(r, 400));
  const latarTerang = await ambilLatar();
  laporan.tema = {
    gelap: latarGelap,
    terang: latarTerang,
    berubah: latarGelap !== latarTerang,
  };

  /* 3. Di tema terang, judul harus tetap lulus kontras AA. */
  laporan.kontrasTerang = await halaman.evaluate(() => {
    const h1 = document.querySelector("h1");
    if (!h1) return null;
    const ke = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const [r1, g1, b1] = ke(getComputedStyle(h1).color);
    const [r2, g2, b2] = ke(getComputedStyle(document.body).backgroundColor);
    const lin = (c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const L1 = 0.2126 * lin(r1) + 0.7152 * lin(g1) + 0.0722 * lin(b1);
    const L2 = 0.2126 * lin(r2) + 0.7152 * lin(g2) + 0.0722 * lin(b2);
    const a = Math.max(L1, L2), b = Math.min(L1, L2);
    return +((a + 0.05) / (b + 0.05)).toFixed(2);
  });

  await halaman.screenshot({ path: path.join(KELUAR, "beranda-terang.png") });

  /* Kembali ke gelap. */
  await halaman.click('button[aria-label*="tema"]');
  await new Promise((r) => setTimeout(r, 400));

  /* 4. Video dan poster. */
  laporan.video = await halaman.evaluate(() => {
    const v = document.querySelector("video");
    if (!v) return { ada: false };
    return {
      ada: true,
      poster: v.getAttribute("poster"),
      preload: v.getAttribute("preload"),
      sumber: v.querySelector("source")?.getAttribute("src"),
      durasiMetadata: v.duration || null,
    };
  });

  /* 5. Poster benar benar termuat sebagai gambar. */
  laporan.poster = await halaman.evaluate(
    (akar) =>
      new Promise((selesai) => {
        const im = new Image();
        im.onload = () => selesai({ termuat: true, lebar: im.naturalWidth, tinggi: im.naturalHeight });
        im.onerror = () => selesai({ termuat: false });
        im.src = akar + "/media/poster-panduan.jpg";
      }),
    ALAMAT,
  );

  /* 6. Tidak ada gulir mendatar di desktop maupun ponsel. */
  laporan.gulir = await halaman.evaluate(() => ({
    desktop: document.documentElement.scrollWidth > window.innerWidth + 1,
  }));
  await halaman.setViewport({ width: 390, height: 844 });
  await new Promise((r) => setTimeout(r, 600));
  laporan.gulir.ponsel = await halaman.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  await halaman.screenshot({ path: path.join(KELUAR, "beranda-ponsel.png") });

  /* 7. Tangkapan layar desktop, untuk diperiksa matanya sendiri. */
  await halaman.setViewport({ width: 1440, height: 900 });
  await new Promise((r) => setTimeout(r, 600));
  await halaman.screenshot({ path: path.join(KELUAR, "beranda-gelap.png") });

  laporan.galat = galat;
  console.log(JSON.stringify(laporan, null, 2));

  await peramban.close();
  process.exit(galat.length ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(2);
});
