/**
 * Uji seluruh halaman, desktop dan ponsel, tema gelap dan terang.
 *
 * Yang dicari: galat konsol, gambar yang gagal dimuat, gulir mendatar, dan
 * kontras teks judul di kedua tema. Halaman yang lolos build belum tentu
 * lolos di peramban, terutama setelah token warna diganti.
 *
 *   node alat/uji-halaman.js
 */
const puppeteer = require("puppeteer-core");
const path = require("path");

const ALAMAT = process.env.UJI_URL || "http://localhost:3001";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const HALAMAN = ["/", "/format", "/panduan", "/tentang", "/unduh"];

const jeda = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const peramban = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--enable-unsafe-swiftshader"],
  });

  const hasil = [];
  let jumlahGalat = 0;

  for (const ukuran of [
    { nama: "desktop", width: 1440, height: 900 },
    { nama: "ponsel", width: 390, height: 844 },
  ]) {
    for (const jalur of HALAMAN) {
      const halaman = await peramban.newPage();
      await halaman.setViewport(ukuran);

      const galat = [];
      halaman.on("pageerror", (e) => galat.push("halaman: " + e.message));
      halaman.on("console", (m) => {
        if (m.type() === "error") galat.push("konsol: " + m.text().slice(0, 120));
      });
      halaman.on("requestfailed", (r) =>
        galat.push("muat: " + r.url().replace(ALAMAT, "")),
      );

      const jawab = await halaman.goto(ALAMAT + jalur, {
        waitUntil: "networkidle2",
        timeout: 45000,
      });

      await jeda(600);

      const ukur = await halaman.evaluate(() => {
        const judul = document.querySelector("h1, h2");
        const ke = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
        const lin = (c) => {
          c /= 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };
        let kontras = null;
        if (judul) {
          const [r1, g1, b1] = ke(getComputedStyle(judul).color);
          const [r2, g2, b2] = ke(getComputedStyle(document.body).backgroundColor);
          const L1 = 0.2126 * lin(r1) + 0.7152 * lin(g1) + 0.0722 * lin(b1);
          const L2 = 0.2126 * lin(r2) + 0.7152 * lin(g2) + 0.0722 * lin(b2);
          const a = Math.max(L1, L2), b = Math.min(L1, L2);
          kontras = +((a + 0.05) / (b + 0.05)).toFixed(2);
        }
        return {
          kontras,
          gulirMendatar: document.documentElement.scrollWidth > window.innerWidth + 1,
          // Gambar yang gagal dirender punya ukuran nol.
          gambarRusak: [...document.querySelectorAll("img")]
            .filter((i) => i.complete && i.naturalWidth === 0)
            .map((i) => i.getAttribute("src")),
          teksKosong: document.body.innerText.trim().length < 200,
        };
      });

      // 200 = halaman baru, 304 = halaman sama dari cache. Keduanya benar.
      const status = jawab?.status();
      const statusSah = status === 200 || status === 304;
      if (!statusSah || galat.length || ukur.gulirMendatar || ukur.gambarRusak.length) {
        jumlahGalat++;
      }

      hasil.push({ ukuran: ukuran.nama, jalur, status, ...ukur, galat });
      await halaman.close();
    }
  }

  console.log(JSON.stringify(hasil, null, 2));
  console.log(jumlahGalat ? `\n${jumlahGalat} halaman bermasalah` : "\nsemua halaman bersih");

  await peramban.close();
  process.exit(jumlahGalat ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(2);
});
