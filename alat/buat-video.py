"""
Menyusun video panduan NaoVert dari tangkapan UI aplikasi yang sungguhan.

Yang membedakan versi ini dari versi sebelumnya:

1. Ada suara narasi. Panjang tiap adegan mengikuti panjang kalimatnya, bukan
   dipaksa lima detik. Sebelumnya penonton harus membaca sendiri sambil
   gambar berganti, sehingga selalu terasa tergesa.
2. Kamera hanya bergerak pada panel aplikasi. Jalur judul dan jalur kalimat
   tetap diam, jadi huruf tidak ikut membesar dan marginnya tidak bergeser.
   Versi sebelumnya menzoom seluruh bingkai, dan itu membuat margin kiri 81 px
   sementara kanan 73 px.
3. Sorotan memakai sudut siku, bukan kotak penuh. Kotak penuh menutupi isi
   panel, sudut siku hanya menunjuk bagian yang dibicarakan.

Suara narasi memakai mesin suara Indonesia bawaan Windows (alat/suara.ps1),
jadi tidak ada berkas suara pihak lain yang ikut disimpan di repositori.

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
SUARA_PS1 = AKAR / "alat" / "suara.ps1"
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

# Tata letak 1920x1080. Jalur atas memuat semua keterangan, jalur bawah hanya
# kalimat kunci, jadi panel aplikasi dapat ruang setinggi mungkin.
JALUR_ATAS = 118
JALUR_BAWAH = 92
PANEL_Y = JALUR_ATAS
PANEL_H_MAX = H - PANEL_Y - JALUR_BAWAH

LEAD = 0.55                   # jeda sebelum narasi mulai
EKOR = 0.70                   # jeda setelah narasi habis
TRANSISI = 0.50
ZUM = 1.09                    # pembesaran panel selama satu adegan

ADEGAN = [
    {
        "berkas": "01-kosong.png",
        "judul": "Buka NaoVert",
        "kunci": "Semua mesin sudah terpasang, tidak ada unduhan tambahan.",
        "ucap": "NaoVert terbuka dalam keadaan siap. Semua mesin konversi sudah "
                "terpasang di dalamnya, jadi tidak ada unduhan tambahan sebelum "
                "berkas pertama diproses.",
        "sorot": (0.06, 0.28, 0.94, 0.90),
    },
    {
        "berkas": "02-berkas-masuk.png",
        "judul": "Masukkan berkas",
        "kunci": "Pilih Berkas, Pilih Folder, atau seret berkas ke jendela.",
        "ucap": "Ada tiga cara memasukkan berkas. Tekan Pilih Berkas, tekan "
                "Pilih Folder, atau seret berkas ke jendela. Berkas dari "
                "beberapa folder berbeda boleh masuk sekaligus.",
        "sorot": (0.06, 0.40, 0.94, 0.92),
    },
    {
        "berkas": "03-pilih-format.png",
        "judul": "Pilih format tujuan",
        "kunci": "Hanya format yang benar benar bisa ditulis yang muncul.",
        "ucap": "Daftar tujuan hanya menampilkan format yang benar benar bisa "
                "ditulis untuk berkas itu. Format yang tidak mungkin tidak "
                "pernah muncul, jadi pilihan yang salah tidak perlu ditebak.",
        "sorot": (0.06, 0.30, 0.62, 0.88),
    },
    {
        "berkas": "04-proses.png",
        "judul": "Jalankan konversi",
        "kunci": "Satu antrean, kemajuan per berkas, bisa dihentikan.",
        "ucap": "Satu tekanan tombol memproses seluruh antrean. Kemajuan "
                "setiap berkas terlihat terpisah, dan pekerjaan bisa dihentikan "
                "tanpa menyentuh berkas aslinya.",
        "sorot": (0.06, 0.60, 0.94, 0.94),
    },
    {
        "berkas": "05-selesai.png",
        "judul": "Hasil di folder yang sama",
        "kunci": "Berkas hasil menemani berkas sumber, aslinya tetap utuh.",
        "ucap": "Hasilnya diletakkan di folder yang sama dengan berkas sumber, "
                "dengan nama tambahan sesuai format baru. Berkas asli tidak "
                "diubah.",
        "sorot": (0.06, 0.40, 0.94, 0.92),
    },
    {
        "berkas": "07-gabung.png",
        "judul": "Gabung dokumen",
        "kunci": "PDF, Word, gambar, dan tabel jadi satu berkas.",
        "ucap": "Menu Gabung Dokumen menyatukan PDF, Word, gambar, dan tabel "
                "menjadi satu berkas. Urutan halaman diatur dari daftar di "
                "dalam dialog.",
        "sorot": (0.10, 0.12, 0.90, 0.90),
    },
    {
        "berkas": "06-pengaturan.png",
        "judul": "Pengaturan",
        "kunci": "Tema, perilaku setelah selesai, integrasi Windows.",
        "ucap": "Di Pengaturan ada tema, perilaku setelah konversi selesai, "
                "dan integrasi Windows. Setiap pilihan disimpan, jadi tidak "
                "perlu diulang di sesi berikutnya.",
        "sorot": (0.10, 0.14, 0.90, 0.92),
    },
    {
        "berkas": "08-terang.png",
        "judul": "Tema terang dan gelap",
        "kunci": "Dua tema bawaan, pilihannya diingat aplikasi.",
        "ucap": "Tema terang dan tema gelap sama sama bawaan. Pilihannya "
                "diingat aplikasi, dan seluruh jendela berganti sekaligus, "
                "bukan sebagian.",
        "sorot": (0.06, 0.18, 0.94, 0.92),
    },
]

TUTUP_JUDUL = "Satu aplikasi untuk semua berkas."
TUTUP_KUNCI = "Bagian dari Sayba Arc."
TUTUP_UCAP = "NaoVert, bagian dari Sayba Arc. Panduan lengkap dan unduhan ada di situs Sayba Arc."

_modul_ikon = None


def tanda(ukuran: int) -> Image.Image:
    """Tanda V, diambil dari generator ikon supaya geometrinya persis sama."""
    global _modul_ikon
    if _modul_ikon is None:
        spesifikasi = importlib.util.spec_from_file_location("buat_ikon", IKON_PY)
        _modul_ikon = importlib.util.module_from_spec(spesifikasi)
        spesifikasi.loader.exec_module(_modul_ikon)
    return _modul_ikon.gambar_tanda(ukuran)


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
    """Jalur atas, bingkai panel, dan kalimat kunci. Panelnya ditempel nanti."""
    px = (W - panel_w) // 2
    kanvas = Image.new("RGB", (W, H), LATAR)
    d = ImageDraw.Draw(kanvas)

    # Jalur atas: tanda, nama, keterangan, nomor adegan. Semua disejajarkan
    # pada tepi panel, bukan tepi layar, supaya komposisinya satu blok.
    t = tanda(44)
    kanvas.paste(t, (px, 34), t)

    nama = ImageFont.truetype(FONT_JUDUL, 33)
    d.text((px + 58, 36), "NaoVert", font=nama, fill=TINTA)

    kecil = ImageFont.truetype(FONT_MONO, 17)
    kanan = f"{nomor:02d} / {total:02d}"
    lebar_kanan = d.textlength(kanan, font=kecil)
    d.text((px + panel_w - lebar_kanan, 48), kanan, font=kecil, fill=TINTA_3)
    tengah = "Panduan pemakaian  ·  From Sayba Arc"
    d.text((px + panel_w - lebar_kanan - 24 - d.textlength(tengah, font=kecil), 48),
           tengah, font=kecil, fill=TINTA_3)

    # Bingkai panel. Satu garis tipis, tanpa bayangan: latarnya sudah gelap,
    # bayangan hanya akan jadi kabut.
    d.rectangle([px - 1, PANEL_Y - 1, px + panel_w, PANEL_Y + panel_h], outline=GARIS)

    # Kalimat kunci; kalimat penuh sudah diucapkan narasi.
    font_kunci = ImageFont.truetype(FONT_BIASA, 25)
    baris = potong(d, adegan["kunci"], font_kunci, panel_w, 2)
    ty = PANEL_Y + panel_h + 28
    for b in baris:
        d.text((px, ty), b, font=font_kunci, fill=TINTA_2)
        ty += 33

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


def bingkai_tutup(keluar: Path) -> None:
    im = Image.new("RGB", (W, H), LATAR)
    d = ImageDraw.Draw(im)

    t = tanda(92)
    im.paste(t, (72, 330), t)

    d.text((186, 344), "NaoVert", font=ImageFont.truetype(FONT_JUDUL, 64), fill=TINTA)
    d.text((72, 470), TUTUP_JUDUL, font=ImageFont.truetype(FONT_JUDUL, 74), fill=TINTA)
    d.text((72, 576), TUTUP_KUNCI, font=ImageFont.truetype(FONT_BIASA, 29), fill=TINTA_2)
    d.text((72, 634), ALAMAT, font=ImageFont.truetype(FONT_MONO, 25), fill=TEMBAGA)
    d.text((72, H - 70), "From Sayba Arc", font=ImageFont.truetype(FONT_TEBAL, 19), fill=TEMBAGA)
    im.save(keluar)


def durasi_berkas(berkas: Path) -> float:
    hasil = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(berkas)],
        check=True, capture_output=True, text=True,
    )
    return float(hasil.stdout.strip())


def ucapkan(teks: str, keluar_wav: Path) -> float:
    """Merekam satu kalimat dengan suara Indonesia bawaan Windows."""
    subprocess.run(
        ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass",
         "-File", str(SUARA_PS1), "-Teks", teks, "-Keluar", str(keluar_wav)],
        check=True, capture_output=True, text=True,
    )
    return durasi_berkas(keluar_wav)


def klip_adegan(latar_png: Path, panel_png: Path, lebar: int, tinggi: int,
                sorot: tuple, lama: float, keluar: Path) -> None:
    """Klip satu adegan: latar diam, panel bergerak ke arah sorotan."""
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
        f"[1:v][p]overlay={px}:{PANEL_Y}:format=auto,format=yuv420p[v]"
    )
    subprocess.run(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
         "-i", str(panel_png), "-loop", "1", "-i", str(latar_png),
         "-filter_complex", saringan, "-map", "[v]",
         "-t", f"{lama:.3f}", "-r", str(FPS),
         "-c:v", "libx264", "-preset", "medium", "-crf", "19", str(keluar)],
        check=True,
    )


def klip_diam(png: Path, lama: float, keluar: Path) -> None:
    subprocess.run(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
         "-loop", "1", "-i", str(png), "-t", f"{lama:.3f}", "-r", str(FPS),
         "-vf", "format=yuv420p",
         "-c:v", "libx264", "-preset", "medium", "-crf", "19", str(keluar)],
        check=True,
    )


def main() -> None:
    KELUAR.mkdir(parents=True, exist_ok=True)
    kerja = Path(tempfile.mkdtemp(prefix="naovert-video-"))

    hilang = [a["berkas"] for a in ADEGAN if not (UI / a["berkas"]).exists()]
    if hilang:
        raise SystemExit("tangkapan belum ada: " + ", ".join(hilang))

    # 1. Narasi dulu, karena panjangnya menentukan panjang adegan.
    panjang: list[float] = []
    for i, a in enumerate(ADEGAN):
        lama = ucapkan(a["ucap"], kerja / f"suara-{i:02d}.wav")
        panjang.append(round(lama + LEAD + EKOR, 2))
        print(f"  narasi {i + 1}: {lama:.2f} s -> adegan {panjang[-1]:.2f} s")

    lama_tutup = ucapkan(TUTUP_UCAP, kerja / "suara-tutup.wav")
    panjang_tutup = round(lama_tutup + LEAD + 1.2, 2)
    print(f"  narasi penutup: {lama_tutup:.2f} s -> adegan {panjang_tutup:.2f} s")
    semua_panjang = panjang + [panjang_tutup]

    # 2. Bahan gambar dan klip.
    klip: list[Path] = []
    poster_sumber = None
    for i, a in enumerate(ADEGAN):
        lebar, tinggi = ukuran_panel(Image.open(UI / a["berkas"]))
        latar = kerja / f"latar-{i:02d}.png"
        latar_bingkai(a, i + 1, len(ADEGAN), lebar, tinggi, latar)
        panel = kerja / f"panel-{i:02d}.png"
        panel_berkas(a, lebar, tinggi, panel)

        mp4 = kerja / f"klip-{i:02d}.mp4"
        klip_adegan(latar, panel, lebar, tinggi, a["sorot"], semua_panjang[i], mp4)
        klip.append(mp4)

        if i == 0:
            # Poster: bingkai diam pada panel yang sama, tanpa skala kamera.
            poster_sumber = kerja / "poster-penuh.png"
            kanvas = Image.open(latar).convert("RGB")
            kanvas.paste(Image.open(panel).resize((lebar, tinggi), Image.LANCZOS),
                         ((W - lebar) // 2, PANEL_Y))
            kanvas.save(poster_sumber)

        print(f"  klip {i + 1}: {lebar}x{tinggi}  {semua_panjang[i]:.2f} s")

    tutup = kerja / "tutup.png"
    bingkai_tutup(tutup)
    klip_tutup = kerja / "klip-tutup.mp4"
    klip_diam(tutup, semua_panjang[-1], klip_tutup)
    klip.append(klip_tutup)

    # 3. Sambung dengan transisi silang, lalu garis kemajuan dan pudar.
    masukan: list[str] = []
    for k in klip:
        masukan += ["-i", str(k)]

    saringan = ""
    posisi = 0.0
    sebelumnya = "0:v"
    mulai_adegan = [0.0]
    for i in range(1, len(klip)):
        posisi += semua_panjang[i - 1] - TRANSISI
        mulai_adegan.append(posisi)
        saringan += (
            f"[{sebelumnya}][{i}:v]xfade=transition=fade:"
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

    bisu = kerja / "bisu.mp4"
    subprocess.run(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
         *masukan, "-filter_complex", saringan, "-map", "[v]",
         "-c:v", "libx264", "-preset", "medium", "-crf", "21",
         "-pix_fmt", "yuv420p", str(bisu)],
        check=True,
    )

    # 4. Jalur suara: tiap narasi diletakkan pada waktu mulainya adegan, jadi
    # ucapan dan gambar tidak bergeser walau panjang adegan berbeda.
    suara_masukan: list[str] = []
    for i in range(len(ADEGAN)):
        suara_masukan += ["-i", str(kerja / f"suara-{i:02d}.wav")]
    suara_masukan += ["-i", str(kerja / "suara-tutup.wav")]

    bagian = []
    for i in range(len(semua_panjang)):
        tunda = int((mulai_adegan[i] + LEAD) * 1000)
        bagian.append(
            f"[{i}:a]aresample=48000,highshelf=f=3200:g=2.5,"
            f"adelay={tunda}|{tunda}[a{i}]"
        )
    gabung = "".join(f"[a{i}]" for i in range(len(semua_panjang)))
    bagian.append(
        f"{gabung}amix=inputs={len(semua_panjang)}:normalize=0,"
        f"loudnorm=I=-16:TP=-1.5:LRA=11,"
        f"apad=whole_dur={total:.3f},atrim=0:{total:.3f}[a]"
    )

    jalur = kerja / "suara.m4a"
    subprocess.run(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
         *suara_masukan, "-filter_complex", ";".join(bagian), "-map", "[a]",
         # loudnorm bekerja pada 192 kHz, jadi laju sampel ditetapkan ulang.
         # Tanpa ini hasilnya 96 kHz, dan sebagian peramban menolaknya.
         "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "128k", str(jalur)],
        check=True,
    )

    # 5. Gabungkan gambar dan suara.
    akhir = KELUAR / "panduan-naovert.mp4"
    subprocess.run(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
         "-i", str(bisu), "-i", str(jalur),
         "-map", "0:v", "-map", "1:a",
         "-c:v", "copy", "-c:a", "copy",
         "-movflags", "+faststart", "-shortest", str(akhir)],
        check=True,
    )

    poster = KELUAR / "poster-panduan.jpg"
    Image.open(poster_sumber).save(poster, quality=86, optimize=True)

    shutil.rmtree(kerja, ignore_errors=True)

    for p in (akhir, poster):
        print(f"  {p.relative_to(AKAR)}  {p.stat().st_size:,} B")
    print(f"  durasi total {total:.2f} s")


if __name__ == "__main__":
    main()