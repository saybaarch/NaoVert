/*
 * Ukur tata letak halaman format dan navbar kapsul pada beberapa lebar layar.
 *
 * Yang diperiksa: kotak navbar, apakah kapsul benar benar membulat, lebar tiap
 * kartu, ada tidaknya gulir mendatar, dan jarak aman antara kapsul dan isi.
 */
const puppeteer = require("puppeteer-core");
const path = require("path");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const DASAR = "http://localhost:3001";
const KELUAR = path.resolve(__dirname, "..", ".uji");

const UKURAN = [
  { nama: "ponsel", w: 390, h: 844 },
  { nama: "ponsel-besar", w: 430, h: 900 },
  { nama: "tablet", w: 768, h: 1024 },
  { nama: "laptop", w: 1280, h: 900 },
  { nama: "lebar", w: 1600, h: 1000 },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });

  for (const u of UKURAN) {
    const page = await browser.newPage();
    await page.setViewport({ width: u.w, height: u.h, deviceScaleFactor: 1 });
    const galat = [];
    page.on("console", (m) => m.type() === "error" && galat.push(m.text()));
    page.on("pageerror", (e) => galat.push(String(e)));

    await page.goto(`${DASAR}/format`, { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 400));

    const hasil = await page.evaluate(() => {
      const nav = document.querySelector("header > div");
      const rn = nav?.getBoundingClientRect();
      const gaya = nav ? getComputedStyle(nav) : null;

      // Kartu: article di halaman format
      const kartu = [...document.querySelectorAll("article")].map((el) => {
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      });

      // Baris indeks
      const baris = [...document.querySelectorAll("details")].length;

      const lebarIsi = document.documentElement.scrollWidth;
      const lebarLayar = document.documentElement.clientWidth;

      // Elemen yang melewati tepi kanan
      const lewat = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > lebarLayar + 1.5) {
          const g = getComputedStyle(el);
          if (g.position === "fixed" || g.overflow === "hidden") continue;
          lewat.push(`${el.tagName.toLowerCase()}.${(el.className || "").toString().slice(0, 40)} right=${Math.round(r.right)}`);
        }
      }

      // Isi pertama setelah navbar: apakah tertutup?
      const utama = document.querySelector("main section") || document.querySelector("main");
      const rm = utama?.getBoundingClientRect();

      return {
        nav: rn
          ? {
              x: Math.round(rn.x),
              y: Math.round(rn.y),
              w: Math.round(rn.width),
              h: Math.round(rn.height),
              radius: gaya.borderRadius,
              posisi: gaya.position,
              blur: gaya.backdropFilter,
              latar: gaya.backgroundColor,
            }
          : null,
        kartu,
        baris,
        gulirMendatar: lebarIsi > lebarLayar + 1,
        lebarIsi,
        lebarLayar,
        lewat: lewat.slice(0, 5),
        jarakKeIsi: rm && rn ? Math.round(rm.top - (rn.y + rn.height)) : null,
      };
    });

    console.log(`\n=== ${u.nama} (${u.w}x${u.h})`);
    if (hasil.nav) {
      console.log(`  kapsul: ${hasil.nav.w}x${hasil.nav.h} di (${hasil.nav.x},${hasil.nav.y}) radius=${hasil.nav.radius}`);
      console.log(`  posisi=${hasil.nav.posisi} blur=${hasil.nav.blur}`);
      console.log(`  latar=${hasil.nav.latar}`);
    }
    console.log(`  kartu: ${hasil.kartu.length} -> ${hasil.kartu.map((k) => `${k.w}x${k.h}`).join(", ")}`);
    console.log(`  baris indeks: ${hasil.baris}`);
    console.log(`  jarak kapsul ke isi: ${hasil.jarakKeIsi}px`);
    console.log(`  gulir mendatar: ${hasil.gulirMendatar} (isi ${hasil.lebarIsi} vs layar ${hasil.lebarLayar})`);
    if (hasil.lewat.length) console.log(`  LEWAT TEPI: ${hasil.lewat.join(" | ")}`);
    if (galat.length) console.log(`  GALAT: ${galat.slice(0, 3).join(" | ")}`);

    await page.screenshot({ path: path.join(KELUAR, `format-${u.nama}.png`) });
    await page.close();
  }

  await browser.close();
})();