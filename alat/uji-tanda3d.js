/**
 * Memeriksa tanda tiga dimensi lewat tangkapan layar elemen.
 *
 * Alat lain membaca isi kanvas dengan gl.readPixels, dan hasilnya selalu nol
 * piksel. Itu bukan tanda kanvasnya kosong: setelah bingkai dikomposisikan,
 * buffer gambar sudah dikosongkan karena konteksnya tidak memakai
 * preserveDrawingBuffer. Yang benar adalah memotret elemennya.
 */
const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const AKAR = path.resolve(__dirname, "..");
const UJI = path.join(AKAR, ".uji");

(async () => {
  fs.mkdirSync(UJI, { recursive: true });
  const peramban = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader", "--use-gl=angle"],
  });
  const halaman = await peramban.newPage();
  await halaman.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await halaman.goto("http://localhost:3001/", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2200));

  const kanvas = await halaman.$("canvas");
  if (!kanvas) {
    console.log(JSON.stringify({ galat: "kanvas tidak ada" }));
    await peramban.close();
    process.exit(1);
  }

  const kotak = await kanvas.boundingBox();
  await kanvas.screenshot({ path: path.join(UJI, "kanvas-a.png") });
  await new Promise((r) => setTimeout(r, 900));
  await kanvas.screenshot({ path: path.join(UJI, "kanvas-b.png") });

  // Tanda harus bergerak: dua tangkapan pada waktu berbeda tidak identik.
  const a = fs.readFileSync(path.join(UJI, "kanvas-a.png"));
  const b = fs.readFileSync(path.join(UJI, "kanvas-b.png"));

  console.log(
    JSON.stringify(
      {
        kotak: { lebar: Math.round(kotak.width), tinggi: Math.round(kotak.height) },
        ukuranA: a.length,
        ukuranB: b.length,
        berubah: a.length !== b.length || !a.equals(b),
      },
      null,
      1,
    ),
  );
  await peramban.close();
})();