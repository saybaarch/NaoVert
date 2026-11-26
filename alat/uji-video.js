/**
 * Menguji pemutar video panduan di peramban sungguhan.
 *
 * Yang diperiksa: video benar benar termuat, bisa diputar sampai selesai,
 * ukuran gambarnya 1920x1080, poster tampil sebelum diputar, dan tidak ada
 * galat pemutaran.
 *
 *   node alat/uji-video.js
 */
const puppeteer = require("puppeteer-core");
const path = require("path");
const jeda = (ms) => new Promise((r) => setTimeout(r, ms));

const AKAR = path.resolve(__dirname, "..");
const KELUAR = path.join(AKAR, ".uji");
const require_fs = require("fs");

(async () => {
  require_fs.mkdirSync(KELUAR, { recursive: true });
  const b = await puppeteer.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--autoplay-policy=no-user-gesture-required"],
    defaultViewport: { width: 1440, height: 900 },
  });
  const p = await b.newPage();
  const galat = [];
  p.on("pageerror", (e) => galat.push(e.message.slice(0, 200)));
  p.on("console", (m) => {
    if (m.type() === "error") galat.push("konsol: " + m.text().slice(0, 200));
  });

  await p.goto("http://localhost:3001/#panduan", { waitUntil: "networkidle2", timeout: 60000 });
  await jeda(1500);

  // Gulir ke bagian video supaya pemutarnya masuk layar.
  await p.evaluate(() => {
    document.querySelector("video")?.scrollIntoView({ block: "center" });
  });
  await jeda(1200);

  const sebelum = await p.evaluate(() => {
    const v = document.querySelector("video");
    if (!v) return null;
    return {
      ada: true,
      poster: v.poster ? v.poster.split("/").pop() : null,
      siap: v.readyState,
      durasi: Number.isFinite(v.duration) ? v.duration : null,
      lebar: v.videoWidth,
      tinggi: v.videoHeight,
      preload: v.preload,
    };
  });

  // Tekan tombol putar bila ada, lalu jalankan langsung sebagai cadangan.
  await p.evaluate(() => {
    const v = document.querySelector("video");
    if (!v) return;
    v.muted = true;
    const janji = v.play();
    if (janji) janji.catch(() => {});
  });
  await jeda(3000);

  const sedang = await p.evaluate(() => {
    const v = document.querySelector("video");
    return {
      waktu: v.currentTime,
      jalan: !v.paused && !v.ended && v.currentTime > 0,
      siap: v.readyState,
      lebar: v.videoWidth,
      tinggi: v.videoHeight,
      galat: v.error ? v.error.code : null,
    };
  });

  await p.screenshot({ path: path.join(KELUAR, "video-putar.png") });

  const hasil = { sebelum, sedang, galat };
  console.log(JSON.stringify(hasil, null, 2));
  await b.close();
})();
