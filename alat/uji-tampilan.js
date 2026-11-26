/**
 * Memotret beranda di kedua tema untuk diperiksa, sekaligus memastikan setiap
 * gambar galeri benar benar termuat dan tidak kosong.
 *
 *   node alat/uji-tampilan.js
 */
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const ALAMAT = process.env.UJI_URL || "http://localhost:3001";
const AKAR = path.resolve(__dirname, "..");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const KELUAR = path.join(AKAR, ".uji");  // foto uji, diabaikan git

const jeda = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(KELUAR, { recursive: true });

  const peramban = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--force-device-scale-factor=1"],
  });

  const halaman = await peramban.newPage();
  await halaman.setViewport({ width: 1440, height: 950 });
  await halaman.goto(ALAMAT, { waitUntil: "networkidle2", timeout: 60000 });
  await jeda(1500);

  // Gulir pelan sampai bawah supaya semua animasi masuk layar dan gambar
  // malas termuat. next/image memasang loading="lazy", jadi gambarnya baru
  // diminta setelah mendekati layar.
  await halaman.evaluate(async () => {
    const tinggi = document.body.scrollHeight;
    for (let y = 0; y < tinggi; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 160));
    }
    window.scrollTo(0, tinggi);
  });
  await jeda(2500);

  // Tunggu sampai semua gambar benar benar selesai dimuat, bukan sekadar
  // duga duga lewat jeda.
  await halaman.evaluate(async () => {
    const daftar = [...document.querySelectorAll("img")];
    await Promise.all(
      daftar.map((i) =>
        i.complete
          ? Promise.resolve()
          : new Promise((r) => {
              i.addEventListener("load", r, { once: true });
              i.addEventListener("error", r, { once: true });
            }),
      ),
    );
  });
  await jeda(600);
  await halaman.evaluate(() => window.scrollTo(0, 0));
  await jeda(900);

  const gambar = await halaman.evaluate(() =>
    [...document.querySelectorAll("img")].map((i) => ({
      src: i.getAttribute("src"),
      termuat: i.complete && i.naturalWidth > 0,
      w: i.naturalWidth,
      h: i.naturalHeight,
      tampil: i.getBoundingClientRect().width > 0,
    })),
  );

  await halaman.screenshot({ path: path.join(KELUAR, "tampil-gelap.png"), fullPage: true });

  await halaman.click('button[aria-label*="tema"]');
  await jeda(900);
  await halaman.screenshot({ path: path.join(KELUAR, "tampil-terang.png"), fullPage: true });

  console.log(JSON.stringify({ gambar }, null, 2));
  await peramban.close();
})().catch((e) => {
  console.error(e);
  process.exit(2);
});
