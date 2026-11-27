"""
Menyusun video panduan NaoVert dari tangkapan UI aplikasi yang sungguhan.

Versi ini TANPA AUDIO. Permintaan pemilik proyek (27 November 2026): video
tanpa suara, diganti teks dan transisi yang menarik. Karena itu:

1. Penahan perhatian bukan lagi narasi, tapi teks yang muncul bertahap.
   Judul lebih dulu, lalu kalimatnya menyusul, masing masing dengan pudar
   singkat, sehingga mata pembaca dipimpin, bukan dibombardir.
2. Transisi antar adegan tidak seragam. Silang pudar, geser, lingkaran buka,
   dan dissolve dipakai bergantian, semuanya xfade bawaan ffmpeg, jadi tidak
   ada pustaka tambahan.
3. Panjang adegan tetap (7,2 detik) karena tidak ada suara yang menentukan.
   Angka itu cukup untuk membaca judul dan satu baris kalimat sebelum adegan
   berganti, dan menjaga seluruh video di bawah satu menit.
4. Kamera hanya bergerak pada panel aplikasi. Jalur judul dan jalur kalimat
   tetap diam, jadi huruf tidak ikut membesar dan margin tidak bergeser.
5. Logo pada jalur atas adalah berkas logo ASLI aplikasi, bukan tanda yang
   digambar ulang.

    python alat/buat-video.py
"""
from __future__ import annotations

import importlib.util
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

AKAR = Path(__file__).resolve().parent.parent
UI = AKAR / "public" / "tangkapan"
KELUAR = AKAR / "public" / "media"
IKON_PY = AKAR / "alat" / "buat-ikon.py"

# Alamat yang ditulis di penutup harus alamat yang benar benar hidup. Situs
# naovert.sayba.id belum ada di DNS, jadi yang ditulis situs induknya.
ALAMAT = "sayba.id"

# Warna diambil dari app/globals.css supaya video dan situs satu keluarga.
LATAR = (22, 24, 27)
TINTA = (238, 234, 228)
TINTA_2 = (179, 172, 162)
TINTA_3 = (148, 143, 136)
TEMBAGA = (192, 125, 79)
GARIS = (48, 52, 56)

W, H = 1920, 1080
FPS = 25

# Judul memakai serif, sama seperti judul situs. Georgia adalah serif sistem
# yang paling dekat dengan Instrument Serif di situs, tersedia tanpa unduhan.
FONT_JUDUL = "C:/Windows/Fonts/georgia.ttf"
FONT_TEBAL = "C:/Windows/Fonts/segoeuib.ttf"
FONT_BIASA = "C:/Windows/Fonts/segoeui.ttf"
FONT_MONO = "C:/Windows/Fonts/consola.ttf"

# Tata letak 1920x1080. Jalur atas memuat merek dan nomor adegan, jalur
# bawah memuat judul dan kalimat. Panel diapit keduanya.
JALUR_ATAS = 118
JALUR_BAWAH = 150
PANEL_Y = JALUR_ATAS
PANEL_H_MAX = H - PANEL_Y - JALUR_BAWAH

TRANSISI = 0.60
ZUM = 1.09                    # pembesaran panel selama satu adegan
DUR_ADEGAN = 7.20
DUR_TUTUP = 8.00

# Teks muncul bertahap (detik sejak adegan mulai): judul, lalu kalimatnya.
MULA_JUDUL = 0.35
MULA_KALIMAT = 1.15
PUDAR = 0.40

# Transisi antar adegan bergantian, bukan satu jenis untuk semua. Yang
# dipilih adalah xfade bawaan ffmpeg yang bergerak horizontal atau melingkar,
# supaya cocok dengan arah baca, tanpa efek yang terasa "template".
TRANSISI_ANTAR = [
    "slideleft", "circleopen", "wiperight", "fade",
    "smoothleft", "circleclose", "dissolve", "slideup",
]

ADEGAN = [
    {
        "berkas": "01-kosong.png",
        "judul": "Buka NaoVert",
        "kunci": "Semua mesin sudah terpasang, tidak ada unduhan tambahan.",
        "sorot": (0.06, 0.28, 0.94, 0.90),
    },
    {
        "berkas": "02-berkas-masuk.png",
        "judul": "Masukkan berkas",
        "kunci": "Pilih Berkas, Pilih Folder, atau seret berkas ke jendela.",
        "sorot": (0.06, 0.40, 0.94, 0.92),
    },
    {
        "berkas": "03-pilih-format.png",
        "judul": "Pilih format tujuan",
        "kunci": "Hanya format yang benar benar bisa ditulis yang muncul.",
        "sorot": (0.06, 0.30, 0.62, 0.88),
    },
    {
        "berkas": "04-proses.png",
        "judul": "Jalankan konversi",
        "kunci": "Satu antrean, kemajuan per berkas, bisa dihentikan.",
        "sorot": (0.06, 0.60, 0.94, 0.94),
    },
    {
        "berkas": "05-selesai.png",
        "judul": "Hasil di folder yang sama",
        "kunci": "Berkas hasil menemani berkas sumber, aslinya tetap utuh.",
        "sorot": (0.06, 0.40, 0.94, 0.92),
    },
    {
        "berkas": "07-gabung.png",
        "judul": "Gabung dokumen",
        "kunci": "PDF, Word, gambar, dan tabel jadi satu berkas.",
        "sorot": (0.10, 0.12, 0.90, 0.90),
    },
    {
        "berkas": "06-pengaturan.png",
        "judul": "Pengaturan",
        "kunci": "Tema, perilaku setelah selesai, integrasi Windows.",
        "sorot": (0.10, 0.14, 0.90, 0.92),
    },
    {
        "berkas": "08-terang.png",
        "judul": "Tema terang dan gelap",
        "kunci": "Dua tema bawaan, pilihannya diingat aplikasi.",
        "sorot": (0.06, 0.18, 0.94, 0.92),
    },
]

TUTUP_JUDUL = "Satu aplikasi untuk semua berkas."
TUTUP_KUNCI = "Panduan, daftar format, dan unduhan ada di situs Sayba Arc."

_modul_ikon = None


def tanda(ukuran: int) -> Image.Image:
    """Logo ASLI aplikasi, diambil dari generator ikon situs.

    Generator itu menyalin berkas logo dari folder aset aplikasi, jadi jalur
    atas video memakai gambar yang sama persis dengan tab peramban.
    """
    global _modul_ikon
    if _modul_ikon is None:
        spesifikasi = importlib.util.spec_from_file_location("buat_ikon", IKON_PY)
        _modul_ikon = importlib.util.module_from_spec(spesifikasi)
        spesifikasi.loader.exec_module(_modul_ikon)
    return _modul_ikon.salin("logo-256.png", ukuran)


def potong(d: ImageDraw.ImageDraw, teks: str, font, lebar: int, maks: int = 2) -> list[str]:
    """Membungkus kalimat pada lebar tertentu, dibatasi jumlah barisnya."""
    kata, baris, sekarang = teks.split(), [], ""
    for k in kata:
        calon = (sekarang + " " + k).strip()
        if d.textlength(calon, font=font) > lebar and sekarang:
            baris.append(sekarang)
            sekarang = k
        else:
            sekarang = calon
    if sekarang:
        baris.append(sekarang)
    return baris[:maks]


def ukuran_panel(sumber: Image.Image) -> tuple[int, int]:
    """Ukuran panel terbesar yang masih muat tanpa memotong gambar aplikasi."""
    lebar = W - 2 * 72
    tinggi = int(sumber.height * lebar / sumber.width)
    if tinggi > PANEL_H_MAX:
        tinggi = PANEL_H_MAX
        lebar = int(sumber.width * tinggi / sumber.height)
    return lebar, tinggi


def latar_bingkai(adegan: dict, nomor: int, total: int, panel_w: int,
                  panel_h: int, keluar: Path) -> None:
    """Bingkai dasar tanpa teks gerak: merek, nomor adegan, garis panel."""
    px = (W - panel_w) // 2
    kanvas = Image.new("RGB", (W, H), LATAR)
    d = ImageDraw.Draw(kanvas)

    # Jalur atas: logo asli, nama, keterangan, nomor adegan. Semua disejajarkan
    # pada tepi panel, bukan tepi layar, supaya komposisinya satu blok.
    logo = tanda(44).convert("RGB")
    kanvas.paste(logo, (px, 34))

    nama = ImageFont.truetype(FONT_JUDUL, 33)
    d.text((px + 58, 36), "NaoVert", font=nama, fill=TINTA)

    kecil = ImageFont.truetype(FONT_MONO, 17)
    kanan = f"{nomor:02d} / {total:02d}"
    lebar_kanan = d.textlength(kanan, font=kecil)
    d.text((px + panel_w - lebar_kanan, 48), kanan, font=kecil, fill=TINTA_3)
    tengah = "Panduan tanpa suara  ·  From Sayba Arc"
    d.text((px + panel_w - lebar_kanan - 24 - d.textlength(tengah, font=kecil), 48),
           tengah, font=kecil, fill=TINTA_3)

    # Bingkai panel. Satu garis tipis, tanpa bayangan: latarnya sudah gelap,
    # bayangan hanya akan jadi kabut.
    d.rectangle([px - 1, PANEL_Y - 1, px + panel_w, PANEL_Y + panel_h], outline=GARIS)

    kanvas.save(keluar)


def layer_teks(panel_w: int, panel_h: int, keluar: Path, *,
               judul: str | None = None, kalimat: list[str] | None = None,
               mulai: int = 0) -> None:
    """Satu lapisan transparan berisi sebagian teks adegan.

    Judul dan kalimat dibuat sebagai lapisan terpisah supaya bisa muncul
    bergiliran lewat filter fade, bukan ditulis di gambar dasar yang diam.

    `mulai` menggeser titik turun teks. Karena tiap adegan memanggil fungsi
    ini dua kali (satu lapisan judul, satu lapisan kalimat), lapisan kalimat
    harus mulai tepat di bawah tempat judul berdiri, bukan di titik yang sama.
    """
    px = (W - panel_w) // 2
    kanvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(kanvas)

    ty = PANEL_Y + panel_h + 26 + mulai
    if judul is not None:
        d.text((px, ty), judul, font=ImageFont.truetype(FONT_JUDUL, 33),
               fill=TINTA + (255,))
        ty += 45

    if kalimat:
        font_kunci = ImageFont.truetype(FONT_BIASA, 24)
        for b in kalimat:
            d.text((px, ty), b, font=font_kunci, fill=TINTA_2 + (255,))
            ty += 31

    kanvas.save(keluar)


def panel_berkas(adegan: dict, lebar: int, tinggi: int, keluar: Path, kali: int = 2) -> None:
    """Panel aplikasi beserta sorotannya, digambar pada ukuran kali lipat.

    Digambar lebih besar supaya saat diperbesar kamera tidak pecah. Sorotan
    ikut tergambar di sini, jadi ia bergerak bersama gambar yang ditunjuk.
    """
    sumber = Image.open(UI / adegan["berkas"]).convert("RGB")
    panel = sumber.resize((lebar * kali, tinggi * kali), Image.LANCZOS)
    d = ImageDraw.Draw(panel)

    # Sudut siku pada bagian yang dibicarakan. Panjang lengan mengikuti ukuran
    # kotaknya, jadi pada kotak kecil sudutnya tetap terbaca.
    x0, y0, x1, y1 = adegan["sorot"]
    sx0, sy0 = int(x0 * panel.width), int(y0 * panel.height)
    sx1, sy1 = int(x1 * panel.width), int(y1 * panel.height)
    lengan = max(18 * kali, int(min(sx1 - sx0, sy1 - sy0) * 0.15))
    tebal = 3 * kali
    for (cx, cy, dx, dy) in ((sx0, sy0, 1, 1), (sx1, sy0, -1, 1),
                             (sx0, sy1, 1, -1), (sx1, sy1, -1, -1)):
        d.line([(cx, cy), (cx + dx * lengan, cy)], fill=TEMBAGA, width=tebal)
        d.line([(cx, cy), (cx, cy + dy * lengan)], fill=TEMBAGA, width=tebal)

    panel.save(keluar)


def bingkai_tutup(keluar: Path) -> Path:
    """Latar penutup, lalu dua lapisan teks yang muncul bergiliran."""
    im = Image.new("RGB", (W, H), LATAR)
    d = ImageDraw.Draw(im)

    logo = tanda(92).convert("RGB")
    im.paste(logo, (72, 330))
    d.text((186, 344), "NaoVert", font=ImageFont.truetype(FONT_JUDUL, 64), fill=TINTA)
    d.text((72, 634), ALAMAT, font=ImageFont.truetype(FONT_MONO, 25), fill=TEMBAGA)
    d.line([(72, 700), (1104, 700)], fill=GARIS, width=2)
    d.text((72, H - 70), "From Sayba Arc", font=ImageFont.truetype(FONT_TEBAL, 19), fill=TEMBAGA)
    dasar = keluar.with_name("tutup-dasar.png")
    im.save(dasar)

    k1 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(k1).text(
        (72, 470), TUTUP_JUDUL,
        font=ImageFont.truetype(FONT_JUDUL, 74), fill=TINTA + (255,),
    )
    p1 = keluar.with_name("tutup-judul.png")
    k1.save(p1)

    k2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(k2).text(
        (72, 566), TUTUP_KUNCI,
        font=ImageFont.truetype(FONT_BIASA, 27), fill=TINTA_2 + (255,),
    )
    p2 = keluar.with_name("tutup-kunci.png")
    k2.save(p2)
    return dasar


def klip_adegan(latar_png: Path, panel_png: Path, lebar: int, tinggi: int,
                sorot: tuple, judul_png: Path, kalimat_png: Path,
                lama: float, keluar: Path) -> None:
    """Klip satu adegan: latar diam, panel bergerak, teks muncul bergiliran."""
    n = max(int(lama * FPS), 2)
    px = (W - lebar) // 2

    x0, y0, x1, y1 = sorot
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2

    # zoompan membaca iw/ih dari gambar panel, jadi titik fokus dihitung sebagai
    # pecahan dan dikunci agar tidak melewati tepi.
    saringan = (
        f"[0:v]zoompan=z='1+{ZUM - 1:.4f}*on/{n - 1}':"
        f"x='max(0,min({cx:.4f}*iw-(iw/zoom)/2,iw-iw/zoom))':"
        f"y='max(0,min({cy:.4f}*ih-(ih/zoom)/2,ih-ih/zoom))':"
        f"d={n}:s={lebar}x{tinggi}:fps={FPS}[p];"
        f"[1:v][p]overlay={px}:{PANEL_Y}:format=auto[base];"
        # Judul muncul lebih dulu, lalu kalimatnya menyusul.
        f"[2:v]format=rgba,fade=t=in:st={MULA_JUDUL:.3f}:d={PUDAR:.3f}:alpha=1[jud];"
        f"[base][jud]overlay=0:0:format=auto[tk1];"
        f"[3:v]format=rgba,fade=t=in:st={MULA_KALIMAT:.3f}:d={PUDAR:.3f}:alpha=1[kal];"
        f"[tk1][kal]overlay=0:0:format=auto,format=yuv420p[v]"
    )
    subprocess.run(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
         "-i", str(panel_png), "-loop", "1", "-i", str(latar_png),
         "-loop", "1", "-i", str(judul_png), "-loop", "1", "-i", str(kalimat_png),
         "-filter_complex", saringan, "-map", "[v]",
         "-t", f"{lama:.3f}", "-r", str(FPS), "-an",
         "-c:v", "libx264", "-preset", "medium", "-crf", "19", str(keluar)],
        check=True,
    )


def klip_tutup_png(dasar: Path, judul_png: Path, kunci_png: Path,
                   lama: float, keluar: Path) -> None:
    """Klip penutup: dasar diam, dua lapis teks muncul bergiliran."""
    saringan = (
        f"[1:v]format=rgba,fade=t=in:st=0.50:d={PUDAR:.3f}:alpha=1[tx0];"
        f"[0:v][tx0]overlay=0:0:format=auto[tk1];"
        f"[2:v]format=rgba,fade=t=in:st=1.40:d={PUDAR:.3f}:alpha=1[tx1];"
        f"[tk1][tx1]overlay=0:0:format=auto,format=yuv420p[v]"
    )
    subprocess.run(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
         "-loop", "1", "-i", str(dasar),
         "-loop", "1", "-i", str(judul_png),
         "-loop", "1", "-i", str(kunci_png),
         "-filter_complex", saringan, "-map", "[v]",
         "-t", f"{lama:.3f}", "-r", str(FPS), "-an",
         "-c:v", "libx264", "-preset", "medium", "-crf", "19", str(keluar)],
        check=True,
    )


def ada_audio(berkas: Path) -> bool:
    hasil = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a",
         "-show_entries", "stream=index", "-of", "csv=p=0", str(berkas)],
        check=True, capture_output=True, text=True,
    )
    return bool(hasil.stdout.strip())


def main() -> None:
    KELUAR.mkdir(parents=True, exist_ok=True)
    kerja = Path(tempfile.mkdtemp(prefix="naovert-video-"))

    hilang = [a["berkas"] for a in ADEGAN if not (UI / a["berkas"]).exists()]
    if hilang:
        raise SystemExit("tangkapan belum ada: " + ", ".join(hilang))

    semua_panjang = [DUR_ADEGAN] * len(ADEGAN) + [DUR_TUTUP]

    # 1. Bahan gambar dan klip per adegan.
    klip: list[Path] = []
    poster_sumber = None
    periksa = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    for i, a in enumerate(ADEGAN):
        sumber = Image.open(UI / a["berkas"])
        lebar, tinggi = ukuran_panel(sumber)
        baris = potong(periksa, a["kunci"], ImageFont.truetype(FONT_BIASA, 24), lebar, 2)

        latar = kerja / f"latar-{i:02d}.png"
        latar_bingkai(a, i + 1, len(ADEGAN), lebar, tinggi, latar)
        panel = kerja / f"panel-{i:02d}.png"
        panel_berkas(a, lebar, tinggi, panel)

        judul_png = kerja / f"judul-{i:02d}.png"
        layer_teks(lebar, tinggi, judul_png, judul=a["judul"])
        kalimat_png = kerja / f"kalimat-{i:02d}.png"
        # Mulai 45 px di bawah titik turun judul: tinggi baris judul itu
        # sendiri. Tanpa geseran ini kalimat mendarat di atas judul.
        layer_teks(lebar, tinggi, kalimat_png, kalimat=baris, mulai=45)

        mp4 = kerja / f"klip-{i:02d}.mp4"
        klip_adegan(latar, panel, lebar, tinggi, a["sorot"], judul_png, kalimat_png,
                    semua_panjang[i], mp4)
        klip.append(mp4)

        if i == 0:
            # Poster: komposisi penuh dengan semua teks sudah tampil.
            px = (W - lebar) // 2
            kanvas = Image.open(latar).convert("RGBA")
            kanvas.paste(Image.open(panel).convert("RGBA").resize(
                (lebar, tinggi), Image.LANCZOS), (px, PANEL_Y))
            kanvas.alpha_composite(Image.open(judul_png))
            kanvas.alpha_composite(Image.open(kalimat_png))
            poster_sumber = kerja / "poster-penuh.png"
            kanvas.convert("RGB").save(poster_sumber)

        print(f"  klip {i + 1}: {lebar}x{tinggi}  {semua_panjang[i]:.2f} s  baris={len(baris)}")

    # 2. Penutup: dasar diam, dua lapis teks bergiliran.
    dasar = bingkai_tutup(kerja / "tutup.png")
    klip_tutup = kerja / "klip-tutup.mp4"
    klip_tutup_png(dasar, kerja / "tutup-judul.png", kerja / "tutup-kunci.png",
                   semua_panjang[-1], klip_tutup)
    klip.append(klip_tutup)

    # 3. Sambung dengan transisi yang bergantian, lalu garis kemajuan dan pudar.
    masukan: list[str] = []
    for k in klip:
        masukan += ["-i", str(k)]

    saringan = ""
    posisi = 0.0
    sebelumnya = "0:v"
    for i in range(1, len(klip)):
        posisi += semua_panjang[i - 1] - TRANSISI
        jenis = TRANSISI_ANTAR[(i - 1) % len(TRANSISI_ANTAR)]
        saringan += (
            f"[{sebelumnya}][{i}:v]xfade=transition={jenis}:"
            f"duration={TRANSISI}:offset={posisi:.3f}[v{i}];"
        )
        sebelumnya = f"v{i}"

    total = posisi + semua_panjang[-1]
    saringan += (
        f"[{sebelumnya}]"
        f"drawbox=x=0:y=ih-5:w='min(iw,iw*t/{total:.3f})':h=5:"
        f"color=0xC07D4F@0.95:t=fill,"
        f"fade=t=in:st=0:d=0.45,fade=t=out:st={max(total - 0.75, 0):.3f}:d=0.75,"
        f"format=yuv420p[v]"
    )

    akhir = KELUAR / "panduan-naovert.mp4"
    subprocess.run(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
         *masukan, "-filter_complex", saringan, "-map", "[v]",
         "-an", "-r", str(FPS),
         "-c:v", "libx264", "-preset", "medium", "-crf", "21",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(akhir)],
        check=True,
    )

    poster = KELUAR / "poster-panduan.jpg"
    Image.open(poster_sumber).save(poster, quality=86, optimize=True)

    shutil.rmtree(kerja, ignore_errors=True)

    for p in (akhir, poster):
        print(f"  {p.relative_to(AKAR)}  {p.stat().st_size:,} B")
    print(f"  durasi total {total:.2f} s")
    print(f"  jalur audio: {'ADA (cacat!)' if ada_audio(akhir) else 'tidak ada, sesuai permintaan'}")


if __name__ == "__main__":
    main()
