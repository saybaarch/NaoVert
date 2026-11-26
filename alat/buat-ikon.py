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
SIMPUL = (16.0, 25.6)
BATANG = [
    # (x atas, y atas, lebar)  kiri tipis dan pendek, kanan tebal dan dalam
    (5.9, 6.2, 3.8),
    (26.1, 5.2, 5.1),
]
SIMPUL_R = 3.0


def gambar_tanda(ukuran, latar=None, sudut_kotak=0.0):
    """Tanda pada kanvas persegi, dengan penskalaan berlebih lalu diperkecil.

    Menggambar pada 8x ukuran akhir lalu memperkecil dengan Lanczos membuat
    tepinya halus tanpa perlu pustaka grafis tambahan. Batang digambar sebagai
    garis tebal dari titik atas ke simpul, sama seperti bentuk di SVG.
    """
    S = ukuran * 8
    skala = S / 32.0
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    if latar:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(sudut_kotak * S), fill=latar)

    bx, by = SIMPUL[0] * skala, SIMPUL[1] * skala
    for ax, ay, lebar in BATANG:
        d.line(
            [(ax * skala, ay * skala), (bx, by)],
            fill=KERTAS,
            width=max(1, int(round(lebar * skala))),
        )

    # Simpul tembaga menutup titik temu, sekaligus merapikan ujung batang.
    r = SIMPUL_R * skala
    d.ellipse([bx - r, by - r, bx + r, by + r], fill=TEMBAGA)

    return im.resize((ukuran, ukuran), Image.LANCZOS)


def main():
    KELUAR.mkdir(parents=True, exist_ok=True)
    dibuat = []

    # Ikon tab. Latar arang supaya terlihat di tab terang maupun gelap.
    for n in (16, 32, 48):
        im = gambar_tanda(n, latar=GELAP, sudut_kotak=0.22)
        p = KELUAR / f"favicon-{n}.png"
        im.save(p)
        dibuat.append(p)

    fav = gambar_tanda(256, latar=GELAP, sudut_kotak=0.22)
    p = KELUAR / "favicon.ico"
    fav.save(p, sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    dibuat.append(p)

    # Ikon aplikasi. Sudut lebih membulat karena dipakai di dock dan taskbar.
    for n in (192, 512, 1024):
        im = gambar_tanda(n, latar=GELAP, sudut_kotak=0.24)
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
    tanda = gambar_tanda(300, latar=None)
    bagikan.paste(tanda, (96, 165), tanda)

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
