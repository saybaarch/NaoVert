/**
 * Periksa tautan: setiap tautan internal harus benar benar hidup.
 *
 * Menelusuri seluruh halaman, mengumpulkan tautan dalam (bukan tautan luar),
 * lalu meminta setiap alamatnya. Tautan yang berakhir di 404 dilaporkan.
 * Sekaligus memeriksa aturan bahasa: tidak boleh ada em dash, dan tidak boleh
 * ada kata gaya pemasaran yang dilarang.
 *
 *   AKAR=http://127.0.0.1:3001 node alat/uji/periksa-tautan.js
 */
const puppeteer = require('puppeteer-core');

const AKAR = process.env.AKAR || 'http://127.0.0.1:3001';
const HALAMAN = ['/', '/format', '/unduh', '/panduan', '/tentang'];

// Kata yang tidak boleh muncul. Daftar ini sengaja pendek dan tegas, bukan
// selera: semuanya bahasa pemasaran yang tidak bisa dibuktikan.
const LARANGAN = [
  'seamless', 'robust', 'leverage', 'cutting-edge', 'revolusioner',
  'terdepan', 'solusi terbaik', 'mulus tanpa', 'terbaik di kelasnya',
  'one-stop', 'game-changer', 'next-level',
];

(async () => {
  const b = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 900 });

  const tautan = new Map(); // alamat -> halaman asal
  const teksSemua = [];
  const masalah = [];

  for (const h of HALAMAN) {
    await p.goto(AKAR + h, { waitUntil: 'networkidle2', timeout: 60000 });
    const isi = await p.evaluate(() => ({
      tautan: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
      teks: document.body.innerText,
    }));

    teksSemua.push({ halaman: h, teks: isi.teks });

    for (const t of isi.tautan) {
      if (!t) continue;
      if (/^(https?:|mailto:|tel:)/.test(t) && !t.startsWith(AKAR)) continue;
      if (t.startsWith('#')) continue;
      const alamat = t.startsWith('http') ? t : AKAR + t;
      if (!tautan.has(alamat)) tautan.set(alamat, h);
    }
  }

  console.log(`Tautan dalam ditemukan: ${tautan.size}`);

  for (const [alamat, asal] of tautan) {
    // Tautan berjangkar tidak menghasilkan permintaan jaringan baru, jadi
    // navigasinya dilakukan ke alamat tanpa jangkar.
    const tanpaJangkar = alamat.split('#')[0];
    const r = await p.goto(tanpaJangkar, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!r) {
      masalah.push(`tidak ada jawaban untuk ${alamat} (dari ${asal})`);
      continue;
    }
    const kode = r.status();
    if (kode >= 400) {
      masalah.push(`tautan mati ${kode} ${alamat} (dari ${asal})`);
    }
  }

  // Em dash dilarang di seluruh teks.
  for (const { halaman, teks } of teksSemua) {
    if (teks.includes('\u2014')) masalah.push(`em dash di ${halaman}`);
    const kecil = teks.toLowerCase();
    for (const kata of LARANGAN) {
      if (kecil.includes(kata)) masalah.push(`kata terlarang "${kata}" di ${halaman}`);
    }
  }

  await b.close();

  if (masalah.length) {
    console.log('\nMASALAH:');
    for (const m of masalah) console.log('  ' + m);
    process.exit(1);
  }
  console.log('\nBERSIH: semua tautan hidup, tidak ada em dash, tidak ada kata terlarang.');
})();
