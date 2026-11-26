/**
 * Uji perilaku halaman di peramban sungguhan.
 *
 * Bukan tata letak, tetapi hal yang hanya bisa dibuktikan dengan menggerakkan
 * halaman: pencarian format menyaring, menu ponsel terbuka dan tertutup,
 * panel kategori bisa dibuka, dan video tidak dimuat sebelum ditekan.
 *
 *   node alat/uji/uji-perilaku.js
 */
const puppeteer = require('puppeteer-core');

// Alamat bisa diganti lewat argumen, supaya uji yang sama bisa dijalankan
// pada server pengembangan maupun pada bangunan produksi.
const AKAR = process.env.AKAR || 'http://127.0.0.1:3001';
let lulus = 0;
let gagal = 0;

function cek(nama, benar, tambahan) {
  if (benar) {
    lulus++;
    console.log(`  OK   ${nama}`);
  } else {
    gagal++;
    console.log(`  GAGAL ${nama}${tambahan ? '  ' + tambahan : ''}`);
  }
}

(async () => {
  const b = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  try {
    /* ── 1. Pencarian format ─────────────────────────────────────────── */
    console.log('\n── Pencarian format ────────────────────────────────');
    const f = await b.newPage();
    await f.setViewport({ width: 1280, height: 900 });
    await f.goto(`${AKAR}/format`, { waitUntil: 'networkidle2', timeout: 60000 });

    // Hitung hanya di dalam isi halaman, karena tombol menu di header juga
    // memakai aria-expanded dan akan mengacaukan angka.
    const awal = await f.evaluate(() => ({
      kategori: document.querySelectorAll('#utama [aria-expanded]').length,
      keterangan: document.querySelector('input[type="search"]') !== null,
    }));
    cek('daftar kategori tampil', awal.kategori === 13, String(awal.kategori));
    cek('kotak pencarian ada', awal.keterangan);

    await f.type('input[type="search"]', 'heic');
    await new Promise((r) => setTimeout(r, 600));

    const hasilHeic = await f.evaluate(() => ({
      teks: document.body.innerText,
      jumlah: document.querySelectorAll('#utama [aria-expanded]').length,
      adaHeic: /heic/i.test(document.body.innerText),
    }));
    cek('pencarian heic menyaring', hasilHeic.jumlah < 13 && hasilHeic.jumlah > 0,
      `${hasilHeic.jumlah} kategori`);
    cek('hasil pencarian menyebut heic', hasilHeic.adaHeic);

    // React memakai pelacak nilai sendiri, jadi menulis .value langsung tidak
    // dianggap perubahan. Kotaknya dikosongkan lalu diketik seperti manusia.
    await f.click('input[type="search"]', { clickCount: 3 });
    await f.keyboard.press('Backspace');
    await f.type('input[type="search"]', 'zzzzbukanformat', { delay: 20 });
    await new Promise((r) => setTimeout(r, 700));

    const kosong = await f.evaluate(() => ({
      jumlah: document.querySelectorAll('#utama [aria-expanded]').length,
      pesan: /tidak ada format yang cocok/i.test(document.body.innerText),
    }));
    cek('kata tanpa hasil menampilkan pesan', kosong.jumlah === 0 && kosong.pesan);

    /* ── 2. Panel kategori di beranda ────────────────────────────────── */
    console.log('\n── Panel kategori ──────────────────────────────────');
    const h = await b.newPage();
    await h.setViewport({ width: 1280, height: 900 });
    await h.goto(`${AKAR}/`, { waitUntil: 'networkidle2', timeout: 60000 });

    const panel = await h.evaluate(() => {
      const d = document.querySelector('#kemampuan details');
      if (!d) return null;
      const sebelum = d.open;
      d.querySelector('summary').click();
      return { sebelum, sesudah: d.open };
    });
    cek('panel kategori bisa dibuka', panel && panel.sebelum === false && panel.sesudah === true,
      JSON.stringify(panel));

    /* ── 3. Video tidak dimuat sebelum ditekan ───────────────────────── */
    console.log('\n── Video ───────────────────────────────────────────');
    const video = await h.evaluate(() => {
      const v = document.querySelector('video');
      if (!v) return null;
      return {
        preload: v.getAttribute('preload'),
        siap: v.readyState,
        tombol: Boolean(document.querySelector('[aria-label*="Putar"]')),
        poster: v.getAttribute('poster'),
      };
    });
    cek('video memakai preload none', video && video.preload === 'none', JSON.stringify(video));
    cek('video belum dimuat', video && video.siap === 0, String(video && video.siap));
    cek('tombol putar tersedia', video && video.tombol);
    cek('poster terpasang', video && /poster\.jpg$/.test(video.poster || ''));

    /* ── 4. Menu ponsel ─────────────────────────────────────────────── */
    console.log('\n── Menu ponsel ─────────────────────────────────────');
    const m = await b.newPage();
    await m.setViewport({ width: 390, height: 844, isMobile: true });
    await m.goto(`${AKAR}/`, { waitUntil: 'networkidle2', timeout: 60000 });

    const tombol = await m.$('[aria-controls="menu-ponsel"]');
    cek('tombol menu ada di ponsel', Boolean(tombol));

    if (tombol) {
      await tombol.click();
      await new Promise((r) => setTimeout(r, 400));
      const terbuka = await m.evaluate(() => {
        const p = document.getElementById('menu-ponsel');
        if (!p) return { ada: false };
        const tautan = [...p.querySelectorAll('a')].map((a) => a.textContent.trim());
        return { ada: true, tautan, aria: document.querySelector('[aria-controls="menu-ponsel"]').getAttribute('aria-expanded') };
      });
      cek('menu terbuka', terbuka.ada && terbuka.aria === 'true', JSON.stringify(terbuka).slice(0, 100));
      cek('menu berisi tautan', terbuka.ada && terbuka.tautan.length >= 4,
        (terbuka.tautan || []).join(', '));

      // Escape harus menutup menu.
      await m.keyboard.press('Escape');
      await new Promise((r) => setTimeout(r, 400));
      const tertutup = await m.evaluate(() => !document.getElementById('menu-ponsel'));
      cek('Escape menutup menu', tertutup);
    }

    /* ── 5. Angka di layar cocok dengan data ────────────────────────── */
    console.log('\n── Angka ───────────────────────────────────────────');
    const angkaLayar = await h.evaluate(() => {
      const dl = document.querySelector('dl');
      return dl ? [...dl.querySelectorAll('dd')].map((d) => d.textContent.trim()) : [];
    });
    const angkaData = await f.evaluate(async () => {
      // Data format sekarang dibaca saat bangunan dibuat dan ikut tertanam di
      // halaman, bukan disajikan sebagai berkas publik. Jadi pembandingnya
      // diambil dari endpoint yang memang ada, bukan dari /data/format.json.
      const r = await fetch('/format');
      const t = await r.text();
      const m = t.match(/(\d+)\s*kategori,\s*(\d+)\s*jenis berkas dikenali,\s*(\d+)\s*tujuan/);
      return m ? [m[1], m[2], m[3]] : null;
    });
    cek('tiga angka pertama cocok dengan data',
      angkaData !== null && angkaLayar.slice(0, 3).join(',') === angkaData.join(','),
      `layar=${angkaLayar.join(',')} data=${angkaData ? angkaData.join(',') : 'tidak terbaca'}`);
    cek('angka mesin sepuluh', angkaLayar[3] === '10', `layar=${angkaLayar[3]}`);
  } finally {
    await b.close();
  }

  console.log(`\nRINGKASAN ${lulus} lulus, ${gagal} gagal`);
  process.exit(gagal ? 1 : 0);
})();