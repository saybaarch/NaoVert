"""
Menghasilkan seluruh berkas ikon situs dari LOGO ASLI aplikasi.

Perintah pemilik proyek (27 November 2026): pakai logo asli, jangan dibuat
lagi. Karena itu berkas ini tidak lagi menggambar tanda apa pun. Ia hanya
menyalin dan memperkecil berkas logo dari folder aplikasi:

  NaoVert/assets/logo-256.png        -> versi gelap
  NaoVert/assets/logo-light-256.png  -> versi terang
  NaoVert/assets/icon.png            -> ikon aplikasi (1024)
  NaoVert/assets/icon-512.png        -> ikon aplikasi (512)
  NaoVert/assets/icon.ico            -> favicon Windows

Perkecilan memakai LANCZOS supaya tepi tetap halus. Semua berkas yang keluar
bisa ditelusuri ke satu sumber: folder aset aplikasi.

    python alat/buat-ikon.py
"""
from PIL import Image
from pathlib import Path

AKAR = Path(__file__).resolve().parent.parent
SUMBER = AKAR.parent / "NaoVert" / "assets"
KELUAR = AKAR / "public" / "img"

GELAP = (22, 24, 27)
KERTAS = (238, 234, 228)
TINTA_2 = (179, 172, 162)
TEMBAGA = (192, 125, 79)


def salin(nama: str, ukuran: int) -> Image.Image:
    """Logo asli pada ukuran persegi berapa pun, tepi halus, rasio utuh."""
    im = Image.open(SUMBER / nama).convert("RGBA")
    return im.resize((ukuran, ukuran), Image.LANCZOS)


def main():
    KELUAR.mkdir(parents=True, exist_ok=True)
    dibuat = []

    # Salinan langsung berkas asli: logo untuk situs, dua tema.
    for nama_sumber, nama_keluar in (
        ("logo-256.png", "logo-asli.png"),
        ("logo-light-256.png", "logo-asli-terang.png"),
    ):
        im = Image.open(SUMBER / nama_sumber).convert("RGBA")
        p = KELUAR / nama_keluar
        im.save(p)
        dibuat.append(p)

    # Ikon tab: logo asli diperkecil, bukan tanda yang digambar ulang.
    for n in (16, 32, 48):
        p = KELUAR / f"favicon-{n}.png"
        salin("logo-256.png", n).save(p)
        dibuat.append(p)

    p = KELUAR / "favicon.ico"
    Image.open(SUMBER / "icon.ico").save(
        p, sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
    )
    dibuat.append(p)

    # Ikon aplikasi situs: persis berkas yang dipakai aplikasi.
    for nama_sumber, n in (("icon.png", 1024), ("icon-512.png", 512)):
        src = Image.open(SUMBER / nama_sumber).convert("RGBA")
        p = KELUAR / f"icon-{n}.png"
        (src if src.size == (n, n) else src.resize((n, n), Image.LANCZOS)).save(p)
        dibuat.append(p)
    p = KELUAR / "icon-192.png"
    salin("icon-512.png", 192).save(p)
    dibuat.append(p)

    # Gambar berbagi 1200x630. Logo asli di kiri, teks di kanan.
    from PIL import ImageDraw, ImageFont

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
    tanda = salin("logo-256.png", 320)
    bagikan.paste(tanda, (96, (630 - 320) // 2), tanda)

    dg.text((450, 218), "NaoVert", font=font(96), fill=KERTAS)
    dg.text((452, 330), "Konverter berkas untuk Windows", font=font(36), fill=TINTA_2)
    dg.text((452, 392), "Semua mesin sudah terpasang", font=font(30), fill=TINTA_2)
    dg.line([(452, 470), (1104, 470)], fill=TEMBAGA, width=3)
    dg.text((452, 500), "From Sayba Arc", font=font(26), fill=TEMBAGA)
    p = KELUAR / "bagikan.png"
    bagikan.save(p)
    dibuat.append(p)

    for p in dibuat:
        print(f"  {p.relative_to(AKAR)}  {p.stat().st_size:,} B")


if __name__ == "__main__":
    main()
