/**
 * Mengukur palet dan tipografi aplikasi NaoVert yang sungguhan.
 *
 * Tujuannya satu: situs harus memakai identitas NaoVert, bukan meminjam
 * warna dan huruf dari tempat lain. Angka yang keluar dari sini dipakai
 * sebagai dasar token warna di app/globals.css.
 *
 *   node alat/ukur-aplikasi.js
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');

const RENDERER = 'file:///E:/SAYBA ARC (BUSSINESS)/WEBSITE PROJECT (Web development)/NaoVert/src/renderer/index.html';

// Jembatan sependek mungkin: cukup untuk boot, karena yang diukur CSS-nya.
const JEMBATAN = `
window.naovert = {
  app: { info: async () => ({ version: '1.0.0' }) },
  formats: { list: async () => ({ families: [
    { id: 'gambar', judul: 'Gambar', masuk: ['png','jpg','webp','heic'], keluar: ['png','jpg','webp','avif'], mesin: 'libvips' },
    { id: 'dokumen', judul: 'Dokumen', masuk: ['docx','pdf','md'], keluar: ['pdf','docx','txt'], mesin: 'Pandoc' },
  ], engines: [], extensions: ['png','jpg','docx','pdf'] }) },
  settings: { get: async () => ({ theme: 'dark' }), set: async () => true },
  engines: { detect: async () => [], installable: async () => ({}), install: async () => true, onInstallProgress: () => {} },
  dialog: { pickFiles: async () => [], pickFolder: async () => null, pickOutput: async () => null },
  fs: { inspect: async () => [], thumbnail: async () => null },
  convert: { run: async () => ({}), cancel: async () => true, onProgress: () => {} },
  merge: { inspect: async () => ({}), pickOutput: async () => null, run: async () => ({}), onProgress: () => {} },
  integration: { state: async () => ({}), setContextMenu: async () => true, setCloseToTray: async () => true, setAutoStart: async () => true, onChanged: () => {} },
  shell: { openExternal: async () => true, openPath: async () => true, showItem: async () => true },
  external: { onRequest: () => {} },
  menu: { on: () => {} },
};
`;

(async () => {
  const b = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const p = await b.newPage();
  await p.setViewport({ width: 1280, height: 780 });
  await p.evaluateOnNewDocument(JEMBATAN);
  await p.goto(RENDERER, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));

  const hasil = await p.evaluate(() => {
    const akar = document.documentElement;
    const gaya = getComputedStyle(akar);

    // Semua variabel CSS yang dideklarasikan di :root atau [data-theme].
    const variabel = {};
    for (const lembar of document.styleSheets) {
      let aturan;
      try { aturan = lembar.cssRules; } catch { continue; }
      for (const r of aturan) {
        if (!r.style) continue;
        if (r.selectorText && /:root|\[data-theme/.test(r.selectorText)) {
          for (const nama of r.style) {
            if (nama.startsWith('--')) variabel[nama] = r.style.getPropertyValue(nama).trim();
          }
        }
      }
    }

    const ambil = (sel) => {
      const e = document.querySelector(sel);
      if (!e) return null;
      const s = getComputedStyle(e);
      return {
        teks: (e.textContent || '').trim().slice(0, 40),
        warna: s.color,
        latar: s.backgroundColor,
        huruf: s.fontFamily,
        ukuran: s.fontSize,
        bobot: s.fontWeight,
        spasi: s.letterSpacing,
        tinggiBaris: s.lineHeight,
        radius: s.borderRadius,
      };
    };

    return {
      tema: document.body.dataset.theme,
      latarBadan: getComputedStyle(document.body).backgroundColor,
      warnaBadan: getComputedStyle(document.body).color,
      hurufBadan: getComputedStyle(document.body).fontFamily,
      variabel,
      contoh: {
        judulMerek: ambil('#mkBrand, .mk-brand, .brand'),
        tombolUtama: ambil('#convertBtn'),
        tombolPilih: ambil('#pickFilesBtn'),
        judulTampilan: ambil('#viewTitle'),
        labelMesin: ambil('#engineLabel'),
        inputCari: ambil('#searchInput'),
      },
      fontDimuat: [...document.fonts].map((f) => f.family + ' ' + f.weight + ' ' + f.status).slice(0, 20),
    };
  });

  fs.writeFileSync('E:/SAYBA ARC (BUSSINESS)/WEBSITE PROJECT (Web development)/NaoVert Website/alat/video/palet-aplikasi.json', JSON.stringify(hasil, null, 2));

  console.log('tema:', hasil.tema);
  console.log('latar badan:', hasil.latarBadan);
  console.log('warna badan:', hasil.warnaBadan);
  console.log('huruf badan:', hasil.hurufBadan);
  console.log('\n--- variabel CSS ---');
  for (const [k, v] of Object.entries(hasil.variabel)) console.log('  ' + k + ': ' + v);
  console.log('\n--- contoh elemen ---');
  for (const [k, v] of Object.entries(hasil.contoh)) if (v) console.log('  ' + k + ':', JSON.stringify(v));
  console.log('\n--- font dimuat ---');
  console.log('  ' + hasil.fontDimuat.join(' | '));

  await b.close();
})();
