"""
Menyusun video tutorial NaoVert dari tangkapan UI aplikasi yang sungguhan.

Alurnya mengikuti apa yang benar benar dilakukan orang saat memakai aplikasi:
buka aplikasi, masukkan berkas, pilih format, jalankan, ambil hasil. Setiap
adegan menampilkan satu tangkapan asli dengan sorotan pada bagian yang sedang
dibicarakan, ditambah kalimat penjelas di bawahnya.

Tidak ada gambar lama yang dipakai. Semua tangkapan berasal dari
alat/tangkap-ui.js yang menjalankan src/renderer/index.html aplikasi.

    python alat/buat-video.py
"""
from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

AKAR = Path(__file__).resolve().parent.parent
UI = AKAR / "public" / "tangkapan"
KELUAR = AKAR / "public" / "media"

# Alamat yang ditulis di penutup video mengikuti variabel lingkungan yang sama
# dengan situs, supaya tidak pernah menunjuk alamat yang salah.
ALAMAT = os.environ.get("NEXT_PUBLIC_SITUS_URL", "https://naovert.vercel.app")
ALAMAT = ALAMAT.split("://")[-1].rstrip("/")

# Warna diambil dari app/globals.css supaya video dan situs satu keluarga.
LATAR = (22, 24, 27)
TINTA = (238, 234, 228)
TINTA_2 = (179, 172, 162)
TEMBAGA = (192, 125, 79)
ARANG = (32, 35, 38)

W, H = 1920, 1080
FONT_TEBAL = "C:/Windows/Fonts/segoeuib.ttf"
FONT_BIASA = "C:/Windows/Fonts/segoeui.ttf"
FONT_MONO = "C:/Windows/Fonts/consola.ttf"

# Ukuran tata letak dihitung dari kanvas 1920x1080.
PANEL_W = 1440
PANEL_X = (W - PANEL_W) // 2
PANEL_Y = 70
JUDUL_Y = 26
JUDUL_UKURAN = 34

# Satu adegan: gambar, kalimat penjelas, dan bagian yang disorot.
# Sorotan ditulis sebagai pecahan (x0, y0, x1, y1) dari gambar aslinya.
ADEGAN = [
    {
        "berkas": "01-kosong.png",
        "judul": "1. Buka NaoVert",
        "isi": "Jendela utama langsung siap dipakai. Semua mesin konversi sudah terpasang, tidak ada yang perlu diunduh lagi.",
        "sorot": (0.06, 0.30, 0.94, 0.88),
    },
    {
        "berkas": "02-berkas-masuk.png",
        "judul": "2. Masukkan berkas",
        "isi": "Klik Pilih Berkas atau Pilih Folder, atau seret berkas ke jendela. Bisa banyak berkas sekaligus dari folder berbeda.",
        "sorot": (0.06, 0.42, 0.94, 0.90),
    },
    {
        "berkas": "03-pilih-format.png",
        "judul": "3. Pilih format tujuan",
        "isi": "Daftar tujuan hanya berisi format yang benar benar bisa ditulis untuk berkas itu. Yang tidak mungkin tidak pernah muncul.",
        "sorot": (0.06, 0.30, 0.60, 0.86),
    },
    {
        "berkas": "04-proses.png",
        "judul": "4. Jalankan konversi",
        "isi": "Kemajuan terlihat per berkas. Pekerjaan bisa dibatalkan kapan saja tanpa merusak berkas asli.",
        "sorot": (0.06, 0.62, 0.94, 0.92),
    },
    {
        "berkas": "05-selesai.png",
        "judul": "5. Hasil di folder yang sama",
        "isi": "Berkas hasil masuk ke folder yang sama dengan berkas aslinya. Aslinya tidak pernah diubah.",
        "sorot": (0.06, 0.42, 0.94, 0.90),
    },
    {
        "berkas": "07-gabung.png",
        "judul": "6. Gabung banyak berkas",
        "isi": "PDF, Word, gambar, dan tabel bisa disatukan jadi satu berkas. Urutan halaman diatur dari daftar di dalam dialog.",
        "sorot": (0.12, 0.12, 0.88, 0.88),
    },
    {
        "berkas": "06-pengaturan.png",
        "judul": "7. Sekali atur, berlaku terus",
        "isi": "Di Pengaturan ada tema, perilaku setelah selesai, dan integrasi Windows. Semua pilihan tersimpan.",
        "sorot": (0.10, 0.14, 0.90, 0.90),
    },
    {
        "berkas": "08-terang.png",
        "judul": "8. Tema terang dan gelap",
        "isi": "Kedua tema sama sama bawaan aplikasi. Pilihannya diingat, jadi tidak perlu diatur ulang setiap kali dibuka.",
        "sorot": (0.06, 0.20, 0.94, 0.90),
    },
]

# Durasi tiap adegan dalam detik. Cukup untuk membaca dua baris kalimat.
DURASI = 5.0
TRANSISI = 0.45

def bingkai(adegan: dict, keluar: Path) -> None:
    """Menyusun satu bingkai 1920x1080 dari tangkapan aplikasi."""
    sumber = Image.open(UI / adegan["berkas"]).convert("RGB")

    # Tangkapan diambil pada 2x. Panel disesuaikan ukurannya supaya kalimat
    # penjelas dan penanda bawah tidak pernah bertabrakan, berapa pun tinggi
    # tangkapannya. Lebar maksimum dipakai bila masih muat.
    band = 100                      # ruang untuk dua baris kalimat
    bawah = 62                      # ruang untuk penanda bawah
    panel_h_max = H - PANEL_Y - band - bawah
    panel_w = min(PANEL_W, int(panel_h_max * sumber.width / sumber.height))
    panel_h = int(sumber.height * panel_w / sumber.width)
    panel = sumber.resize((panel_w, panel_h), Image.LANCZOS)
    px = (W - panel_w) // 2
    py = PANEL_Y

    kanvas = Image.new("RGB", (W, H), LATAR)

    # Judul di atas panel.
    from PIL import ImageDraw, ImageFont

    d = ImageDraw.Draw(kanvas)
    d.text((px, JUDUL_Y), adegan["judul"], font=ImageFont.truetype(FONT_TEBAL, JUDUL_UKURAN), fill=TINTA)

    # Label kecil di kanan atas.
    kecil = ImageFont.truetype(FONT_MONO, 19)
    teks_kanan = "NAOVERT  /  PANDUAN PEMAKAIAN"
    lebar = d.textlength(teks_kanan, font=kecil)
    d.text((W - px - lebar, JUDUL_Y + 12), teks_kanan, font=kecil, fill=TINTA_2)

    # Panel aplikasi dengan bingkai tipis.
    kanvas.paste(panel, (px, py))

    # Sorotan: kotak tembaga tipis di sekitar bagian yang dibicarakan.
    x0, y0, x1, y1 = adegan["sorot"]
    sx0 = px + int(x0 * panel_w)
    sy0 = py + int(y0 * panel_h)
    sx1 = px + int(x1 * panel_w)
    sy1 = py + int(y1 * panel_h)
    d.rectangle([sx0, sy0, sx1, sy1], outline=TEMBAGA, width=4)

    # Kalimat penjelas di bawah panel, dibungkus dua baris.
    isi_font = ImageFont.truetype(FONT_BIASA, 26)
    kata = adegan["isi"].split()
    baris, sekarang = [], ""
    for k in kata:
        calon = (sekarang + " " + k).strip()
        if d.textlength(calon, font=isi_font) > panel_w:
            baris.append(sekarang)
            sekarang = k
        else:
            sekarang = calon
    baris.append(sekarang)

    ty = py + panel_h + 30
    for b in baris[:2]:
        d.text((px, ty), b, font=isi_font, fill=TINTA_2)
        ty += 37

    # Penanda pembuat, satu baris, di kiri bawah.
    d.text((px, H - 44), "From Sayba Arc", font=ImageFont.truetype(FONT_TEBAL, 20), fill=TEMBAGA)

    # Nomor adegan di kanan bawah.
    nomor = f"{ADEGAN.index(adegan) + 1:02d} / {len(ADEGAN):02d}"
    dn = ImageFont.truetype(FONT_MONO, 19)
    d.text((W - px - d.textlength(nomor, font=dn), H - 44), nomor, font=dn, fill=TINTA_2)

    kanvas.save(keluar)


def main() -> None:
    KELUAR.mkdir(parents=True, exist_ok=True)
    kerja = Path(tempfile.mkdtemp(prefix="naovert-video-"))

    hilang = [a["berkas"] for a in ADEGAN if not (UI / a["berkas"]).exists()]
    if hilang:
        raise SystemExit("tangkapan belum ada: " + ", ".join(hilang))

    # 1. Bingkai diam untuk tiap adegan, ditahan selama DURASI.
    klip = []
    for i, a in enumerate(ADEGAN):
        png = kerja / f"adegan-{i:02d}.png"
        bingkai(a, png)
        mp4 = kerja / f"klip-{i:02d}.mp4"
        subprocess.run(
            [
                "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                "-loop", "1", "-i", str(png),
                # Gerak pelan masuk: 100% ke 102% sepanjang klip. Tujuannya
                # menjaga mata tetap di panel, bukan menambah hiasan.
                "-vf",
                f"scale={W*2}:{H*2},zoompan=z='min(zoom+0.00018,1.02)':"
                f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={int(DURASI*25)}:s={W}x{H}:fps=25,"
                f"format=yuv420p",
                "-t", str(DURASI), "-r", "25",
                "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                str(mp4),
            ],
            check=True,
        )
        klip.append(mp4)

    # 2. Akhiran: satu bingkai penutup dengan ajakan yang jelas.
    tutup = kerja / "tutup.png"
    from PIL import ImageDraw, ImageFont

    im = Image.new("RGB", (W, H), LATAR)
    d = ImageDraw.Draw(im)
    d.text((PANEL_X, 400), "Satu aplikasi untuk semua berkas.", font=ImageFont.truetype(FONT_TEBAL, 58), fill=TINTA)
    d.text((PANEL_X, 486), "Semua mesin sudah terpasang sejak awal.", font=ImageFont.truetype(FONT_BIASA, 30), fill=TINTA_2)
    d.text((PANEL_X, 566), f"Unduh di {ALAMAT}", font=ImageFont.truetype(FONT_TEBAL, 30), fill=TEMBAGA)
    d.text((PANEL_X, H - 76), "From Sayba Arc", font=ImageFont.truetype(FONT_TEBAL, 20), fill=TEMBAGA)
    im.save(tutup)

    klip_tutup = kerja / "tutup.mp4"
    subprocess.run(
        [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            "-loop", "1", "-i", str(tutup), "-t", "4", "-r", "25",
            "-vf", "format=yuv420p",
            "-c:v", "libx264", "-preset", "medium", "-crf", "20",
            str(klip_tutup),
        ],
        check=True,
    )

    # 3. Sambung semua klip dengan transisi silang.
    #
    # concat demuxer tidak bisa membuat transisi, jadi dipakai filter xfade
    # yang merangkai klip satu per satu. Karena tiap sambungan memakan waktu
    # TRANSISI detik, posisi sambungan berikutnya bergeser ke belakang.
    semua = klip + [klip_tutup]
    masukan: list[str] = []
    for k in semua:
        masukan += ["-i", str(k)]

    saringan = ""
    panjang = DURASI  # durasi klip pertama
    sebelumnya = "0:v"
    for i in range(1, len(semua)):
        keluaran = f"v{i}"
        mulai = panjang - TRANSISI
        saringan += (
            f"[{sebelumnya}][{i}:v]xfade=transition=fade:"
            f"duration={TRANSISI}:offset={mulai:.3f}[{keluaran}];"
        )
        # Durasi kumulatif: tambah klip baru, kurangi satu tumpang tindih.
        panjang = panjang + (4.0 if i == len(semua) - 1 else DURASI) - TRANSISI
        sebelumnya = keluaran

    saringan = saringan.rstrip(";")

    akhir = KELUAR / "panduan-naovert.mp4"
    subprocess.run(
        [
            "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
            *masukan,
            "-filter_complex", saringan,
            "-map", f"[{sebelumnya}]",
            "-c:v", "libx264", "-preset", "medium", "-crf", "20",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            str(akhir),
        ],
        check=True,
    )

    # 4. Poster: bingkai pertama adegan pertama, dipakai sebelum video diputar.
    poster = KELUAR / "poster-panduan.jpg"
    bingkai(ADEGAN[0], kerja / "poster.png")
    Image.open(kerja / "poster.png").save(poster, quality=86, optimize=True)

    # Bersihkan berkas kerja.
    shutil.rmtree(kerja, ignore_errors=True)

    for p in (akhir, poster):
        print(f"  {p.relative_to(AKAR)}  {p.stat().st_size:,} B")


if __name__ == "__main__":
    main()
