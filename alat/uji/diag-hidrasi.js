/**
 * Diagnosa: apakah React benar benar aktif di halaman?
 *
 * Menangkap galat konsol, galat hidrasi, dan mencoba mengetik untuk melihat
 * apakah state berubah. Keluarannya menjelaskan sebab, bukan hanya gejala.
 */
const puppeteer = require('puppeteer-core');
const AKAR = process.env.AKAR || 'http://127.0.0.1:3000';

(async () => {
  const b = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const p = await b.newPage();
  const log = [];
  p.on('console', (m) => log.push(`[${m.type()}] ${m.text().slice(0, 300)}`));
  p.on('pageerror', (e) => log.push(`[pageerror] ${e.message.slice(0, 400)}`));
  p.on('requestfailed', (r) => log.push(`[gagal] ${r.url().slice(0, 140)}`));

  await p.goto(`${AKAR}/format`, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));

  const info = await p.evaluate(() => {
    const scripts = [...document.querySelectorAll('script[src]')].map((s) => s.src);
    return {
      panjangTeks: document.body.innerText.length,
      cuplikanTeks: document.body.innerText.slice(0, 160).replace(/\n/g, ' | '),
      jumlahSkrip: scripts.length,
      skrip: scripts.map((s) => s.replace(location.origin, '')).slice(0, 12),
      adaReact: typeof window.React !== 'undefined',
      // Penanda Next.js: ada __next_f (data RSC) dan hidrasi React.
      adaNextData: Object.keys(window).filter((k) => k.startsWith('__next')).slice(0, 6),
      jumlahKategori: document.querySelectorAll('[aria-expanded]').length,
      idBagian: [...document.querySelectorAll('section[id]')].map((s) => s.id),
    };
  });

  console.log('── Keadaan halaman ──');
  console.log(JSON.stringify(info, null, 2));

  // Coba ketik lalu lihat apakah jumlah kategori menyusut.
  const input = await p.$('input[type="search"]');
  if (input) {
    await input.click();
    await input.type('heic', { delay: 40 });
    await new Promise((r) => setTimeout(r, 900));
    const sesudah = await p.evaluate(() => ({
      nilai: document.querySelector('input[type="search"]').value,
      jumlahKategori: document.querySelectorAll('[aria-expanded]').length,
      keterangan: (document.body.innerText.match(/\d+ kategori[^\n]*/) || [''])[0],
    }));
    console.log('── Sesudah mengetik ──');
    console.log(JSON.stringify(sesudah, null, 2));
  }

  console.log('── Konsol ──');
  console.log(log.length ? log.join('\n') : '(kosong)');

  await b.close();
})();
