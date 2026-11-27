/**
 * Mengambil tangkapan layar halaman untuk diperiksa.
 *
 * Dipakai setelah perubahan tata letak, supaya hasilnya bisa dilihat langsung
 * tanpa membuka peramban sendiri.
 */
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const AKAR = path.resolve(__dirname, "..");
const UJI = path.join(AKAR, ".uji");

const DAFTAR = [
  { jalur: "/", nama: "lihat-beranda", lebar: 1440, tinggi: 900, penuh: true },
  { jalur: "/format", nama: "lihat-format", lebar: 1440, tinggi: 1100, penuh: true },
  { jalur: "/", nama: "lihat-beranda-terang", lebar: 1440, tinggi: 900, penuh: true, tema: "terang" },
  { jalur: "/", nama: "lihat-ponsel", lebar: 390, tinggi: 844, penuh: false },
];

(async () => {
  fs.mkdirSync(UJI, { recursive: true });
  const peramban = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=angle"],
  });

  for (const d of DAFTAR) {
    const halaman = await peramban.newPage();
    await halaman.setViewport({ width: d.lebar, height: d.tinggi, deviceScaleFactor: 1 });
    if (d.tema) {
      await halaman.evaluateOnNewDocument((t) => {
        localStorage.setItem("naovert-tema", t);
      }, d.tema);
    }
    await halaman.goto("http://localhost:3001" + d.jalur, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1800));
    // Gulir ke dasar lalu kembali, supaya bagian yang muncul saat digulir
    // sempat tampil sebelum dipotret.
    if (d.penuh) {
      await halaman.evaluate(async () => {
        const tinggi = document.body.scrollHeight;
        for (let y = 0; y < tinggi; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await new Promise((r) => setTimeout(r, 700));
    }
    await halaman.screenshot({
      path: path.join(UJI, d.nama + ".png"),
      fullPage: d.penuh,
    });
    console.log("  " + d.nama + ".png");
    await halaman.close();
  }
  await peramban.close();
})();