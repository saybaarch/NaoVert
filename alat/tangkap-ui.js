/**
 * Menangkap UI aplikasi NaoVert yang sungguhan untuk bahan video tutorial.
 *
 * Aplikasi dijalankan langsung dari src/renderer/index.html di Chromium.
 * Jembatan tiruan hanya menggantikan proses utama Electron: pemilihan berkas,
 * pemeriksaan berkas, dan konversi. Tampilan, tata letak, warna, dan huruf
 * semuanya asli dari styles.css aplikasi, bukan tiruan.
 *
 * Hasilnya urutan tangkapan yang mengikuti alur pemakaian sungguhan:
 *   01 kosong, 02 berkas masuk, 03 pilih format, 04 proses, 05 selesai,
 *   06 panel pengaturan.
 *
 *   node alat/tangkap-ui.js
 */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const APLIKASI = 'E:/SAYBA ARC (BUSSINESS)/WEBSITE PROJECT (Web development)/NaoVert';
const RENDERER = 'file:///' + APLIKASI + '/src/renderer/index.html';
// Tangkapan langsung ditulis ke folder aset situs. Satu sumber saja: yang
// dipakai video dan galeri adalah berkas yang sama, jadi tidak ada dua salinan
// yang bisa berbeda diam diam.
const KELUAR = path.resolve(__dirname, '..', 'public', 'tangkapan');

// Daftar format diambil dari registry aplikasi yang sungguhan, bukan ditulis
// ulang. Kalau registry berubah, tangkapan ikut berubah sendiri.
const registry = require(APLIKASI + '/src/main/formats.js');
const KELUARGA = registry.FAMILIES.map((f) => ({
  id: f.id, label: f.label, icon: f.icon, engine: f.engine,
  in: f.in, out: f.out,
}));
console.log('keluarga dari registry:', KELUARGA.length);

// Berkas contoh yang dipakai sepanjang tangkapan. Semuanya gambar, jadi
// satu keluarga, dan target keluarannya banyak: itu yang mau diperlihatkan.
const BERKAS = [
  { nama: 'foto-produk.jpg', ext: 'jpg', ukuran: 2411520 },
  { nama: 'katalog-2026.png', ext: 'png', ukuran: 3874300 },
  { nama: 'logo-toko.webp', ext: 'webp', ukuran: 412800 },
  { nama: 'brosur-heic.heic', ext: 'heic', ukuran: 1856000 },
];

const JEMBATAN = `
const BERKAS = ${JSON.stringify(BERKAS)};
const KELUARGA = ${JSON.stringify(KELUARGA)};
const jalur = (b) => 'C:\\\\Users\\\\Sayba\\\\Documents\\\\NaoVert\\\\' + b.nama;

const mesin = ${JSON.stringify([...new Set(KELUARGA.map((f) => f.engine))])}.map((id) => ({
  id, label: id, terpasang: true, wajib: true,
}));

const keluarga = KELUARGA;

const semuaEkstensi = [...new Set(keluarga.flatMap((f) => f.in))];
const pengaturan = { theme: 'dark', outputMode: 'sama', customOutput: null,
  shell: { contextMenu: false, closeToTray: false, autoStart: false } };

const periksa = BERKAS.map((b) => {
  const fam = keluarga.filter((f) => f.in.includes(b.ext));
  const target = [...new Set(fam.flatMap((f) => f.out))];
  return {
    path: jalur(b), name: b.nama, ext: b.ext, size: b.ukuran,
    families: fam.map((f) => f.id), targets: target, supported: fam.length > 0,
  };
});

window.naovert = {
  app: { info: async () => ({ version: '1.0.0' }) },
  formats: { list: async () => ({ families: keluarga, engines: mesin, extensions: semuaEkstensi }) },
  settings: { get: async () => pengaturan, set: async (p) => { Object.assign(pengaturan, p); return true; } },
  engines: {
    detect: async () => mesin,
    installable: async () => ({}),
    install: async () => true,
    onInstallProgress: () => {},
  },
  dialog: {
    pickFiles: async () => periksa.map((p) => p.path),
    pickFolder: async () => null,
    pickOutput: async () => null,
  },
  fs: {
    inspect: async (daftar) => periksa.filter((p) => (daftar || []).includes(p.path)),
    thumbnail: async () => null,
  },
  convert: {
    run: async () => ({ ok: true }),
    cancel: async () => true,
    onProgress: () => {},
  },
  merge: {
    inspect: async () => ({ bisa: false, jumlah: 0 }),
    pickOutput: async () => null,
    run: async () => ({}),
    onProgress: () => {},
  },
  integration: {
    state: async () => ({ contextMenu: false, closeToTray: false, autoStart: false }),
    setContextMenu: async () => true,
    setCloseToTray: async () => true,
    setAutoStart: async () => true,
    onChanged: () => {},
  },
  shell: { openExternal: async () => true, openPath: async () => true, showItem: async () => true },
  external: { onRequest: () => {} },
  menu: { on: () => {} },
};
`;

const jeda = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(KELUAR, { recursive: true });

  const b = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--force-device-scale-factor=2', '--hide-scrollbars'],
  });

  const p = await b.newPage();
  await p.setViewport({ width: 1240, height: 780, deviceScaleFactor: 2 });

  const galat = [];
  p.on('pageerror', (e) => galat.push(e.message.slice(0, 160)));
  p.on('console', (m) => { if (m.type() === 'error') galat.push('konsol: ' + m.text().slice(0, 160)); });

  await p.evaluateOnNewDocument(JEMBATAN);
  await p.goto(RENDERER, { waitUntil: 'networkidle0', timeout: 60000 });
  await jeda(1600);

  const potret = async (nama) => {
    await jeda(320);
    await p.screenshot({ path: path.join(KELUAR, nama) });
    console.log('  ' + nama);
  };

  // 1. Keadaan kosong: aplikasi baru dibuka, belum ada berkas.
  await potret('01-kosong.png');

  // 2. Berkas masuk lewat tombol Pilih Berkas, alur asli aplikasi.
  await p.click('#pickFilesBtn');
  await jeda(900);
  await potret('02-berkas-masuk.png');

  // 3. Buka pilihan format keluaran, perlihatkan daftar target.
  const adaPilihan = await p.evaluate(() => {
    const s = document.querySelector('#targetSelect');
    if (!s) return null;
    return { jumlah: s.options.length, contoh: [...s.options].slice(0, 12).map((o) => o.value || o.textContent) };
  });
  console.log('  target tersedia:', JSON.stringify(adaPilihan));

  await p.evaluate(() => {
    const s = document.querySelector('#targetSelect');
    if (s) { s.focus(); s.size = Math.min(10, s.options.length); }
  });
  await jeda(500);
  await potret('03-pilih-format.png');
  await p.evaluate(() => {
    const s = document.querySelector('#targetSelect');
    if (s) { s.size = 1; s.selectedIndex = 0; s.blur(); }
  });

  // 4. Proses berjalan.
  await p.evaluate(() => {
    const w = document.querySelector('#progressWrap');
    if (w) w.hidden = false;
    const bar = document.querySelector('#progressBar');
    const teks = document.querySelector('#progressText');
    if (bar) bar.style.width = '58%';
    if (teks) teks.textContent = '2 dari 4 berkas, 58%';
  });
  await potret('04-proses.png');

  // 5. Selesai: semua berkas berstatus beres.
  await p.evaluate(() => {
    const w = document.querySelector('#progressWrap');
    if (w) w.hidden = true;
    document.querySelectorAll('#fileList .file-row, #fileList li').forEach((r) => {
      r.dataset.status = 'done';
      r.classList.add('is-done', 'done');
      const s = r.querySelector('.file-status, .status');
      if (s) s.textContent = 'Selesai';
    });
  });
  await potret('05-selesai.png');

  // 6. Panel pengaturan, memperlihatkan mesin yang sudah terpasang.
  await p.click('#settingsBtn');
  await jeda(800);
  await potret('06-pengaturan.png');
  await p.evaluate(() => document.querySelector('#modalClose')?.click());
  await jeda(400);

  // 7. Dialog Gabung Dokumen, alur asli dari tombol di bilah kiri.
  await p.evaluate(() => document.querySelector('#mergeBtn')?.click());
  await jeda(900);
  const isiGabung = await p.evaluate(() => {
    const m = document.querySelector('#modal');
    return m && !m.closest('[hidden]')
      ? { judul: m.querySelector('h2, h3')?.textContent?.trim(), teks: m.innerText.slice(0, 220) }
      : null;
  });
  console.log('  dialog gabung:', JSON.stringify(isiGabung));
  await potret('07-gabung.png');
  await p.evaluate(() => document.querySelector('#modalClose')?.click());
  await jeda(400);

  // 8. Tema terang aplikasi, supaya galeri memperlihatkan kedua tema.
  await p.evaluate(() => document.querySelector('#themeBtn')?.click());
  await jeda(700);
  await potret('08-terang.png');
  await p.evaluate(() => document.querySelector('#themeBtn')?.click());
  await jeda(500);

  const ringkas = await p.evaluate(() => ({
    jumlahBaris: document.querySelectorAll('#fileList .file-row, #fileList li').length,
    latar: getComputedStyle(document.body).backgroundColor,
    teks: getComputedStyle(document.body).color,
    aksen: getComputedStyle(document.querySelector('#convertBtn')).backgroundColor,
  }));

  fs.writeFileSync(path.join(KELUAR, 'ringkas.json'), JSON.stringify(ringkas, null, 2));
  console.log('\n  baris berkas:', ringkas.jumlahBaris);
  console.log('  latar:', ringkas.latar, '| teks:', ringkas.teks, '| aksen:', ringkas.aksen);
  if (galat.length) {
    console.log('\n  galat:');
    for (const g of [...new Set(galat)].slice(0, 6)) console.log('    ' + g);
  } else {
    console.log('  tanpa galat halaman');
  }

  await b.close();
})();
