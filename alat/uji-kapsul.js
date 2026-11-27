/*
 * Periksa apakah ada teks yang tertutup kapsul navigasi.
 *
 * Kapsul mengambang, jadi ia tidak memakai ruang tata letak. Yang harus
 * dibuktikan: teks pertama di halaman selalu mulai di bawah tepi bawah kapsul,
 * termasuk setelah halaman digulir ke atas lagi.
 */
const puppeteer = require("puppeteer-core");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const DASAR = "http://localhost:3001";
const HALAMAN = ["/", "/format", "/panduan", "/tentang", "/unduh"];
const UKURAN = [
  { nama: "ponsel", w: 390, h: 844 },
  { nama: "tablet", w: 768, h: 1024 },
  { nama: "laptop", w: 1440, h: 900 },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });

  let gagal = 0;

  for (const u of UKURAN) {
    for (const jalur of HALAMAN) {
      const page = await browser.newPage();
      await page.setViewport({ width: u.w, height: u.h });
      const galat = [];
      page.on("pageerror", (e) => galat.push(String(e)));
      page.on("console", (m) => m.type() === "error" && galat.push(m.text()));

      await page.goto(DASAR + jalur, { waitUntil: "networkidle0", timeout: 60000 });
      await new Promise((r) => setTimeout(r, 300));

      const hasil = await page.evaluate(() => {
        const nav = document.querySelector("header > div");
        const bawah = nav ? nav.getBoundingClientRect().bottom : 0;

        // Semua elemen berisi teks yang benar benar terlihat
        const tertutup = [];
        for (const el of document.querySelectorAll("main *")) {
          const teks = (el.textContent || "").trim();
          if (!teks) continue;
          // hanya elemen daun yang memuat teks sendiri
          const punyaAnakTeks = [...el.children].some(
            (c) => (c.textContent || "").trim().length > 0,
          );
          if (punyaAnakTeks) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) continue;
          const g = getComputedStyle(el);
          if (g.visibility === "hidden" || g.display === "none" || g.opacity === "0") continue;
          if (r.top < bawah && r.bottom > 0) {
            tertutup.push({
              teks: teks.slice(0, 40),
              top: Math.round(r.top),
              bawah: Math.round(r.bottom),
            });
          }
        }
        return { bawah: Math.round(bawah), tertutup: tertutup.slice(0, 5) };
      });

      const status = hasil.tertutup.length === 0 && galat.length === 0 ? "OK  " : "GAGAL";
      if (status === "GAGAL") gagal++;
      console.log(
        `${status} ${u.nama.padEnd(7)} ${jalur.padEnd(9)} kapsul bawah=${hasil.bawah}px` +
          (hasil.tertutup.length
            ? ` | TERTUTUP: ${hasil.tertutup.map((t) => `"${t.teks}"@${t.top}`).join(", ")}`
            : "") +
          (galat.length ? ` | GALAT: ${galat[0].slice(0, 80)}` : ""),
      );
      await page.close();
    }
  }

  await browser.close();
  console.log(gagal === 0 ? "\nSemua halaman bersih." : `\n${gagal} pemeriksaan gagal.`);
  process.exit(gagal === 0 ? 0 : 1);
})();