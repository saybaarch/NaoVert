/**
 * Periksa halaman Next.js di peramban sungguhan.
 *
 * Yang dicari: elemen meluber keluar layar, teks bertumpuk, kotak kosong yang
 * seharusnya berisi, galat konsol, dan permintaan jaringan yang gagal.
 *
 *   node alat/uji/periksa-next.js / 1280 900
 */
const puppeteer = require('puppeteer-core');

const ALAMAT = (process.env.AKAR || 'http://127.0.0.1:3001') + (process.argv[2] || '/');
const LEBAR = Number(process.argv[3] || 1280);
const TINGGI = Number(process.argv[4] || 900);
const SIMPAN = process.argv[5];

(async () => {
  const b = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });
  const p = await b.newPage();
  await p.setViewport({ width: LEBAR, height: TINGGI, deviceScaleFactor: 1 });

  const galat = [];
  const gagalJaringan = [];
  // Galat WebSocket HMR hanya ada di mode pengembangan dan tidak ada di
  // bangunan produksi. Kalau ikut dihitung, pemeriksaan selalu merah.
  const abaikan = (t) => /_next\/hmr|websocket connection/i.test(t);

  p.on('console', (m) => {
    if (m.type() === 'error' && !abaikan(m.text())) galat.push(m.text().slice(0, 200));
  });
  p.on('pageerror', (e) => {
    if (!abaikan(e.message)) galat.push('pageerror: ' + e.message.slice(0, 200));
  });
  p.on('requestfailed', (r) => {
    if (!abaikan(r.url())) gagalJaringan.push(r.url().slice(0, 120));
  });
  p.on('response', (r) => {
    if (r.status() >= 400) gagalJaringan.push(`${r.status()} ${r.url().slice(0, 110)}`);
  });

  await p.goto(ALAMAT, { waitUntil: 'networkidle2', timeout: 90000 });
  await new Promise((r) => setTimeout(r, 1500));

  // Jalankan animasi muncul dengan menggulir seluruh halaman.
  await p.evaluate(async () => {
    const tinggi = document.documentElement.scrollHeight;
    for (let y = 0; y < tinggi; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 900));

  const hasil = await p.evaluate(() => {
    const lebarLayar = document.documentElement.clientWidth;
    const kotak = (el) => el.getBoundingClientRect();
    const terlihat = (el) => {
      const g = getComputedStyle(el);
      if (g.display === 'none' || g.visibility === 'hidden' || g.opacity === '0') return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };

    const meluber = [];
    for (const el of document.querySelectorAll('main *, footer *, header *')) {
      if (!terlihat(el)) continue;
      // Elemen di dalam wadah yang memang memotong isinya (pita bergulir) wajar meluber.
      let induk = el.parentElement;
      let dipotong = false;
      while (induk && induk !== document.body) {
        const g = getComputedStyle(induk);
        if (g.overflowX === 'hidden' || g.overflowX === 'clip' || g.overflow === 'hidden') {
          dipotong = true;
          break;
        }
        induk = induk.parentElement;
      }
      if (dipotong) continue;
      const r = kotak(el);
      if (r.right > lebarLayar + 2 || r.left < -2) {
        meluber.push({
          tag: el.tagName,
          kelas: (el.className || '').toString().slice(0, 50),
          kiri: Math.round(r.left),
          kanan: Math.round(r.right),
        });
      }
    }

    // Teks yang bertumpuk: kotak teks yang saling menimpa secara berarti.
    // Isi <details> yang tertutup sengaja dilewati: Chrome tetap menghitung
    // kotaknya walau tidak digambar, jadi kalau tidak dilewati akan terbaca
    // sebagai tumpang tindih palsu.
    const dalamDetailsTertutup = (el) => {
      let n = el;
      while (n) {
        if (n.tagName === 'DETAILS' && !n.open) return true;
        n = n.parentElement;
      }
      return false;
    };
    const teks = [...document.querySelectorAll('h1,h2,h3,p,li,a,span')].filter(
      (el) =>
        el.textContent.trim() &&
        el.children.length === 0 &&
        terlihat(el) &&
        !dalamDetailsTertutup(el),
    );
    const tumpang = [];
    for (let i = 0; i < teks.length; i++) {
      for (let j = i + 1; j < Math.min(i + 26, teks.length); j++) {
        const a = kotak(teks[i]);
        const b2 = kotak(teks[j]);
        const x = Math.max(0, Math.min(a.right, b2.right) - Math.max(a.left, b2.left));
        const y = Math.max(0, Math.min(a.bottom, b2.bottom) - Math.max(a.top, b2.top));
        if (x > 6 && y > 6) {
          tumpang.push({
            a: teks[i].textContent.trim().slice(0, 34),
            b: teks[j].textContent.trim().slice(0, 34),
            luas: Math.round(x * y),
          });
        }
      }
    }

    const judul = document.querySelector('h1');
    return {
      lebarLayar,
      tinggiHalaman: document.documentElement.scrollHeight,
      meluber: meluber.slice(0, 8),
      tumpang: tumpang.slice(0, 6),
      judulTeks: judul ? judul.innerText.replace(/\n/g, ' / ') : '(tidak ada h1)',
      judulUkuran: judul ? getComputedStyle(judul).fontSize : '-',
      jumlahBagian: document.querySelectorAll('section').length,
      adaGambarRusak: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
      latar: getComputedStyle(document.body).backgroundColor,
    };
  });

  console.log(`\n=== ${ALAMAT} @ ${LEBAR}x${TINGGI} ===`);
  console.log('judul      :', hasil.judulTeks);
  console.log('ukuran h1  :', hasil.judulUkuran);
  console.log('latar      :', hasil.latar);
  console.log('tinggi     :', hasil.tinggiHalaman + 'px');
  console.log('bagian     :', hasil.jumlahBagian);

  let masalah = 0;
  const cek = (nama, ok, detail) => {
    console.log(`${ok ? 'LULUS' : 'GAGAL'} ${nama}${detail ? '  ' + detail : ''}`);
    if (!ok) masalah++;
  };

  cek('tidak ada elemen meluber keluar layar', hasil.meluber.length === 0,
    hasil.meluber.map((m) => `${m.tag}.${m.kelas}[${m.kiri}..${m.kanan}]`).join(' '));
  cek('tidak ada teks bertumpuk', hasil.tumpang.length === 0,
    hasil.tumpang.map((t) => `"${t.a}" x "${t.b}"`).join(' | '));
  cek('tidak ada gambar rusak', hasil.adaGambarRusak === 0, String(hasil.adaGambarRusak));
  cek('tidak ada galat konsol', galat.length === 0, galat.slice(0, 2).join(' | '));
  cek('tidak ada permintaan gagal', gagalJaringan.length === 0, gagalJaringan.slice(0, 3).join(' | '));

  if (SIMPAN) {
    await p.screenshot({ path: SIMPAN, fullPage: true });
    console.log('tangkapan  :', SIMPAN);
  }

  console.log(masalah === 0 ? '\nRINGKASAN BERSIH' : `\nRINGKASAN ${masalah} MASALAH`);
  await b.close();
  process.exit(masalah ? 1 : 0);
})();
