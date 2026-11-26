/**
 * Mendeteksi elemen yang bertumpuk atau keluar dari layar.
 *
 * Yang diperiksa: teks yang saling menimpa, elemen yang melewati tepi kanan,
 * dan tombol yang terlalu kecil untuk ditekan jari. Diukur di desktop dan
 * ponsel, sebab masalah tata letak biasanya hanya muncul di salah satunya.
 *
 *   node alat/uji-tumpuk.js
 */
const puppeteer = require("puppeteer-core");
const jeda = (ms) => new Promise((r) => setTimeout(r, ms));

const UKURAN = [
  { nama: "desktop", width: 1440, height: 900 },
  { nama: "ponsel", width: 390, height: 844 },
];

const HALAMAN = ["/", "/format", "/panduan", "/tentang", "/unduh"];

(async () => {
  const b = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const laporan = [];

  for (const u of UKURAN) {
    for (const jalur of HALAMAN) {
      const p = await b.newPage();
      await p.setViewport({ width: u.width, height: u.height, deviceScaleFactor: 1 });
      await p.goto("http://localhost:3001" + jalur, { waitUntil: "networkidle2", timeout: 60000 });
      await jeda(700);

      // Gulir sampai bawah lalu balik, supaya semua animasi dan gambar termuat.
      await p.evaluate(async () => {
        const tinggi = document.body.scrollHeight;
        for (let y = 0; y < tinggi; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await jeda(900);

      const hasil = await p.evaluate((lebar) => {
        // Hanya elemen yang benar benar tergambar. Isi <details> yang tertutup
        // tetap punya kotak ukur walau tidak terlihat, dan itu bukan tumpukan.
        const tergambar = (e) => {
          if (e.checkVisibility && !e.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
          for (let a = e; a; a = a.parentElement) {
            if (a.tagName === "DETAILS" && !a.open && e !== a.querySelector("summary")) return false;
          }
          return true;
        };
        const teks = [...document.querySelectorAll("h1,h2,h3,p,li,dd,dt,a,button,span")];
        const el = teks.filter((e) => {
          if (!tergambar(e)) return false;
          const r = e.getBoundingClientRect();
          const g = getComputedStyle(e);
          return r.width > 4 && r.height > 4 && g.visibility !== "hidden" && g.opacity !== "0";
        });

        // Keluar tepi kanan.
        const keluar = [];
        for (const e of el) {
          const r = e.getBoundingClientRect();
          // Elemen di dalam wadah ber-overflow-hidden memang sengaja dipotong,
          // misalnya pita format yang bergulir sendiri.
          let dipotong = false;
          for (let a = e.parentElement; a; a = a.parentElement) {
            const g = getComputedStyle(a);
            if (g.overflowX === "hidden" || g.overflowX === "clip") { dipotong = true; break; }
          }
          if (dipotong) continue;
          if (r.right > lebar + 2 && r.width < lebar * 3) {
            keluar.push(`${e.tagName.toLowerCase()} "${(e.textContent || "").trim().slice(0, 30)}" kanan=${Math.round(r.right)}`);
          }
        }

        // Tombol terlalu kecil untuk jari (hanya dinilai di ponsel).
        const kecil = [];
        for (const e of document.querySelectorAll("button,a.tombol,a[role=button]")) {
          const r = e.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && r.height < 32) {
            kecil.push(`"${(e.textContent || "").trim().slice(0, 24)}" tinggi=${Math.round(r.height)}`);
          }
        }

        // Teks yang bertumpuk: dua elemen beririsan lebih dari setengah luas
        // salah satunya, dan bukan leluhur-turunan satu sama lain.
        const tumpuk = [];
        for (let i = 0; i < el.length; i++) {
          const a = el[i];
          const ra = a.getBoundingClientRect();
          if (ra.height > 200) continue;
          for (let j = i + 1; j < el.length; j++) {
            const c = el[j];
            if (a.contains(c) || c.contains(a)) continue;
            const rc = c.getBoundingClientRect();
            const x = Math.max(0, Math.min(ra.right, rc.right) - Math.max(ra.left, rc.left));
            const y = Math.max(0, Math.min(ra.bottom, rc.bottom) - Math.max(ra.top, rc.top));
            const iris = x * y;
            const luasKecil = Math.min(ra.width * ra.height, rc.width * rc.height);
            if (luasKecil > 0 && iris / luasKecil > 0.55) {
              const ta = (a.textContent || "").trim().slice(0, 22);
              const tc = (c.textContent || "").trim().slice(0, 22);
              if (ta && tc) tumpuk.push(`"${ta}" x "${tc}"`);
            }
          }
        }

        const doc = document.documentElement;
        return {
          gulirMendatar: doc.scrollWidth > lebar + 2 ? doc.scrollWidth - lebar : 0,
          keluar: [...new Set(keluar)].slice(0, 6),
          kecil: [...new Set(kecil)].slice(0, 6),
          tumpuk: [...new Set(tumpuk)].slice(0, 6),
          jumlahTumpuk: new Set(tumpuk).size,
        };
      }, u.width);

      laporan.push({ ukuran: u.nama, jalur, ...hasil });
      await p.close();
    }
  }

  await b.close();

  let cacat = 0;
  for (const r of laporan) {
    const buruk = r.gulirMendatar || r.keluar.length || r.kecil.length || r.tumpuk.length;
    if (buruk) cacat++;
    console.log(
      `${r.ukuran.padEnd(8)} ${r.jalur.padEnd(9)} gulir=${r.gulirMendatar} keluar=${r.keluar.length} kecil=${r.kecil.length} tumpuk=${r.jumlahTumpuk}`,
    );
    for (const x of r.keluar) console.log("    keluar:", x);
    for (const x of r.kecil) console.log("    kecil:", x);
    for (const x of r.tumpuk) console.log("    tumpuk:", x);
  }
  console.log(cacat === 0 ? "\nsemua bersih" : `\n${cacat} pemeriksaan bermasalah`);
})();
