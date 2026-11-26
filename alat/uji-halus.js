/**
 * Mengukur apakah gerak benar benar terlihat sebagai gerak halus, bukan
 * lompatan. Caranya: ambil nilai gaya di beberapa titik waktu lalu hitung
 * berapa nilai berbeda yang muncul di antaranya.
 *
 *   node alat/uji-halus.js
 */
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const jeda = (ms) => new Promise((r) => setTimeout(r, ms));

const AKAR = path.resolve(__dirname, "..");
const KELUAR = path.join(AKAR, ".uji");

(async () => {
  fs.mkdirSync(KELUAR, { recursive: true });
  const b = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
    defaultViewport: { width: 1440, height: 900 },
  });
  const p = await b.newPage();
  await p.goto("http://localhost:3001/", { waitUntil: "networkidle2", timeout: 60000 });
  await jeda(1200);

  // Rekam opasitas baris judul sejak halaman mulai dimuat. Ini mengukur
  // gerak yang sesungguhnya terjadi, bukan gerak yang dipicu ulang oleh uji.
  await p.evaluateOnNewDocument(() => {
    window.__rekam = [];
    const mulai = Date.now();
    const id = setInterval(() => {
      const baris = [...document.querySelectorAll(".baris-judul")];
      if (baris.length) {
        window.__rekam.push(
          baris.map((e) => Number(getComputedStyle(e).opacity).toFixed(3)),
        );
      }
      if (Date.now() - mulai > 2000) clearInterval(id);
    }, 40);
  });
  await p.goto("http://localhost:3001/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await jeda(2400);
  const judul = await p.evaluate(() => {
    const rekam = window.__rekam || [];
    const kolom = (i) => rekam.map((r) => r[i]).filter(Boolean);
    const ringkas = (n) => {
      const v = kolom(n);
      return {
        sampel: v.length,
        nilaiUnik: new Set(v).size,
        awal: v[0],
        tengah: v[Math.floor(v.length / 2)],
        akhir: v[v.length - 1],
      };
    };
    return { baris1: ringkas(0), baris2: ringkas(1), baris3: ringkas(2) };
  });

  // Rekam garis label yang tumbuh.
  const label = await p.evaluate(async () => {
    const l = document.querySelector(".label-garis");
    if (!l) return null;
    l.classList.remove("label-garis-tampil");
    await new Promise((r) => setTimeout(r, 60));
    l.classList.add("label-garis-tampil");
    const nilai = [];
    for (let i = 0; i < 16; i++) {
      nilai.push(parseFloat(getComputedStyle(l, "::before").width));
      await new Promise((r) => setTimeout(r, 50));
    }
    return { awal: nilai[0], akhir: nilai[nilai.length - 1], nilaiUnik: new Set(nilai).size };
  });

  console.log(JSON.stringify({ judul, label }, null, 2));
  await b.close();
})();
