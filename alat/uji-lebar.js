/**
 * Menguji lebar layar ekstrem.
 *
 * 320px adalah ponsel terkecil yang masih dipakai orang (iPhone SE generasi
 * pertama ke bawah), 1920px monitor umum. Di antara keduanya sudah diuji
 * alat lain; yang di sini justru kedua ujungnya.
 */
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const AKAR = path.resolve(__dirname, "..");
const UJI = path.join(AKAR, ".uji");

const UKURAN = [
  { nama: "mini", lebar: 320, tinggi: 600 },
  { nama: "monitor", lebar: 1920, tinggi: 1080 },
];

const HALAMAN = ["/", "/format", "/panduan", "/tentang", "/unduh"];

(async () => {
  fs.mkdirSync(UJI, { recursive: true });
  const peramban = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=angle"],
  });

  let masalah = 0;
  for (const u of UKURAN) {
    for (const jalur of HALAMAN) {
      const halaman = await peramban.newPage();
      await halaman.setViewport({ width: u.lebar, height: u.tinggi, deviceScaleFactor: 1 });
      await halaman.goto("http://localhost:3001" + jalur, { waitUntil: "networkidle2" });
      await new Promise((r) => setTimeout(r, 900));

      const hasil = await halaman.evaluate((lebar) => {
        const doc = document.documentElement;
        const gulir = doc.scrollWidth - lebar;

        /* Teks yang keluar dari kotaknya sendiri.
         *
         * Dua jenis sengaja dilewati karena bukan cacat:
         * 1. Isi pita format berjalan. Pita itu marquee di dalam
         *    overflow-hidden, jadi memang ada di luar layar.
         * 2. Tautan di dalam paragraf. Ia mengalir bersama kalimat, bukan
         *    sasaran sentuh tersendiri, dan tingginya mengikuti tinggi huruf.
         * Keduanya diberi penanda di bawah. */
        const dilewati = (el) =>
          el.closest("[aria-hidden='true']") !== null ||
          el.closest("p") !== null;

        const keluar = [];
        for (const el of document.querySelectorAll("h1,h2,h3,p,li,span,a,button")) {
          if (dilewati(el)) continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (r.right > lebar + 1.5 || r.left < -1.5) {
            keluar.push({
              teks: (el.textContent || "").trim().slice(0, 34),
              kiri: Math.round(r.left),
              kanan: Math.round(r.right),
            });
          }
        }

        /* Sasaran sentuh di bawah 44px, dengan alasan yang sama: tautan di
         * dalam paragraf dan tautan lompat-ke-isi tidak dihitung. */
        const kecil = [];
        for (const el of document.querySelectorAll("a,button,summary,input,select")) {
          if (dilewati(el)) continue;
          if (el.classList.contains("lompat-isi")) continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (r.height < 44) {
            kecil.push({
              teks: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 28),
              tinggi: Math.round(r.height),
            });
          }
        }

        return { gulir, keluar: keluar.slice(0, 6), kecil: kecil.slice(0, 6) };
      }, u.lebar);

      const buruk = hasil.gulir > 1 || hasil.keluar.length > 0;
      if (buruk) masalah++;
      console.log(
        `${buruk ? "MASALAH" : "OK     "} ${u.nama.padEnd(8)} ${jalur.padEnd(9)} ` +
          `gulir=${hasil.gulir} keluar=${hasil.keluar.length} kecil=${hasil.kecil.length}`,
      );
      if (hasil.keluar.length) console.log("   keluar:", JSON.stringify(hasil.keluar));
      if (hasil.kecil.length) console.log("   kecil:", JSON.stringify(hasil.kecil));

      await halaman.close();
    }
  }

  await peramban.close();
  console.log(masalah === 0 ? "\nSemua lebar bersih." : `\n${masalah} halaman bermasalah.`);
  process.exit(masalah === 0 ? 0 : 1);
})();