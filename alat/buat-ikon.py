"""
Menghasilkan seluruh berkas ikon situs dari satu tanda yang sama.

Tanda digambar dengan geometri identik dengan components/ikon.tsx, jadi
logo di kepala halaman, ikon tab peramban, dan ikon aplikasi tidak pernah
berbeda bentuk. Tidak ada gambar lama yang dipakai ulang.

Sumber warna diambil dari app/globals.css supaya ikon ikut tema NaoVert:
arang hangat, kertas gading, tembaga.

    python alat/buat-ikon.py
"""
from PIL import Image, ImageDraw
from pathlib import Path

AKAR = Path(__file__).resolve().parent.parent
KELUAR = AKAR / "public" / "img"

GELAP = (22, 24, 27)
KERTAS = (238, 234, 228)
TEMBAGA = (192, 125, 79)

# Geometri tanda, sama dengan ikon.tsx (kanvas 32x32).
# Batang digambar dari titik atas ke simpul, jadi keduanya selalu bertemu.
SIMPUL = (16.0, 26.5)
BATANG = [
    # (x atas, y atas, lebar)  kiri tipis, kanan tebal
    (6.2, 4.6, 3.2),
    (25.8, 4.6, 4.2),
]
SIMPUL_R = 2.6


def _poligon_batang(px, py, lebar, skala):
    """Empat sudut batang, dihitung sama seperti rect yang diputar di SVG.

    Dulu batang digambar dengan ImageDraw.line, dan itu menambah ketebalan di
    ujung sehingga tanda jadi lebih lebar daripada di SVG. Dengan poligon,
    bentuk PNG dan SVG dijamin sama.
    """
    import math

    dx, dy = SIMPUL[0] - px, SIMPUL[1] - py
    panjang = math.hypot(dx, dy)
    rot = -math.degrees(math.atan2(dx, dy))   # searah jarum jam, sama dengan rotate()
    t = math.radians(rot)
    c, s = math.cos(t), math.sin(t)

    titik = []
    for lx, ly in ((-lebar / 2, 0), (lebar / 2, 0), (lebar / 2, panjang), (-lebar / 2, panjang)):
        X = px + lx * c - ly * s
        Y = py + lx * s + ly * c
        titik.append((X * skala, Y * skala))
    return titik


def gambar_tanda(ukuran, latar=None, sudut_kotak=0.0):
    """Tanda pada kanvas persegi, dengan penskalaan berlebih lalu diperkecil.

    Menggambar pada 8x ukuran akhir lalu memperkecil dengan Lanczos membuat
    tepinya halus tanpa perlu pustaka grafis tambahan.
    """
    S = ukuran * 8
    skala = S / 32.0
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    if latar:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(sudut_kotak * S), fill=latar)

    for ax, ay, lebar in BATANG:
        d.polygon(_poligon_batang(ax, ay, lebar, skala), fill=KERTAS)

    # Simpul tembaga menutup titik temu, sekaligus merapikan ujung batang.
    bx, by = SIMPUL[0] * skala, SIMPUL[1] * skala
    r = SIMPUL_R * skala
    d.ellipse([bx - r, by - r, bx + r, by + r], fill=TEMBAGA)

    return im.resize((ukuran, ukuran), Image.LANCZOS)


def main():
    KELUAR.mkdir(parents=True, exist_ok=True)

    # Tanda digambar pada kanvas kerja yang lebih besar, lalu dipusatkan dan
    # diperkecil ke ukuran akhir. Dengan cara ini margin di keempat sisi
    # selalu sama, berapa pun bentuk tandanya.
    KANVAS_KERJA = 64
    MARGIN = 0.15          # 15% tiap sisi, jadi tanda memakai 70% kanvas

    def bertanda(ukuran, latar=None, sudut_kotak=0.0):
        """Tanda dipusatkan dengan margin sama di tiap sisi, rasio tetap utuh."""
        besar = gambar_tanda(KANVAS_KERJA * 4, latar=None)
        tanda = besar.crop(besar.getbbox())

        # Sisi terpanjang dipakai sebagai patokan, sisi lain mengikuti rasio.
        kotak = int(ukuran * (1 - 2 * MARGIN))
        skala = kotak / max(tanda.size)
        lebar = max(1, round(tanda.width * skala))
        tinggi = max(1, round(tanda.height * skala))
        tanda = tanda.resize((lebar, tinggi), Image.LANCZOS)

        akhir = Image.new("RGBA", (ukuran, ukuran), (0, 0, 0, 0))
        if latar:
            d = ImageDraw.Draw(akhir)
            d.rounded_rectangle(
                [0, 0, ukuran - 1, ukuran - 1],
                radius=int(sudut_kotak * ukuran),
                fill=latar,
            )
        akhir.alpha_composite(tanda, ((ukuran - lebar) // 2, (ukuran - tinggi) // 2))
        return akhir

    dibuat = []

    # Ikon tab. Latar arang supaya terlihat di tab terang maupun gelap.
    for n in (16, 32, 48):
        im = bertanda(n, latar=GELAP, sudut_kotak=0.22)
        p = KELUAR / f"favicon-{n}.png"
        im.save(p)
        dibuat.append(p)

    fav = bertanda(256, latar=GELAP, sudut_kotak=0.22)
    p = KELUAR / "favicon.ico"
    fav.save(p, sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    dibuat.append(p)

    # Ikon aplikasi. Sudut lebih membulat karena dipakai di dock dan taskbar.
    for n in (192, 512, 1024):
        im = bertanda(n, latar=GELAP, sudut_kotak=0.24)
        p = KELUAR / f"icon-{n}.png"
        im.save(p)
        dibuat.append(p)

    # Gambar berbagi 1200x630. Tanda di kiri, nama dan keterangan di kanan.
    from PIL import ImageFont

    def font(ukuran):
        for calon in (
            "C:/Windows/Fonts/segoeuib.ttf",
            "C:/Windows/Fonts/seguisb.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
        ):
            if Path(calon).exists():
                return ImageFont.truetype(calon, ukuran)
        return ImageFont.load_default()

    bagikan = Image.new("RGB", (1200, 630), GELAP)
    dg = ImageDraw.Draw(bagikan)
    tanda = gambar_tanda(480, latar=None).crop(gambar_tanda(480, latar=None).getbbox())
    tanda.thumbnail((300, 300), Image.LANCZOS)
    bagikan.paste(tanda, (96, (630 - tanda.height) // 2), tanda)

    dg.text((450, 218), "NaoVert", font=font(96), fill=KERTAS)
    dg.text((452, 330), "Konverter berkas untuk Windows", font=font(36), fill=(179, 172, 162))
    dg.text((452, 392), "Semua mesin sudah terpasang", font=font(30), fill=(179, 172, 162))
    dg.line([(452, 470), (1104, 470)], fill=TEMBAGA, width=3)
    dg.text((452, 500), "From Sayba Arc", font=font(26), fill=TEMBAGA)
    p = KELUAR / "bagikan.png"
    bagikan.save(p)
    dibuat.append(p)

    for p in dibuat:
        print(f"  {p.relative_to(AKAR)}  {p.stat().st_size:,} B")


if __name__ == "__main__":
    main()
