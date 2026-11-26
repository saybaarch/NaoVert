#!/usr/bin/env python3
"""Menyusun adegan video presentasi NaoVert dari tangkapan layar asli.

Setiap adegan dirender sebagai PNG 1280x720, lalu ffmpeg memberi gerak
(zoom pelan) dan transisi silang. Tidak ada elemen rekaan di sini: semua
gambar berasal dari tangkapan layar aplikasi yang benar-benar berjalan.
"""

import os
from PIL import Image, ImageDraw, ImageFont

AKAR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SHOTS = os.path.join(AKAR, "aset", "img", "shots")
KELUAR = os.path.join(AKAR, "alat", "video", "adegan")
os.makedirs(KELUAR, exist_ok=True)

W, H = 1280, 720

BG = (22, 24, 27)
BG_PANEL = (32, 35, 38)
LINE = (58, 62, 67)
TEXT = (238, 234, 228)
DIM = (168, 163, 156)
ACCENT = (192, 125, 79)

F = "C:/Windows/Fonts/"
f_bold = ImageFont.truetype(F + "segoeuib.ttf", 58)
f_bold_s = ImageFont.truetype(F + "segoeuib.ttf", 34)
f_light = ImageFont.truetype(F + "segoeuil.ttf", 26)
f_body = ImageFont.truetype(F + "segoeui.ttf", 22)
f_meta = ImageFont.truetype(F + "segoeui.ttf", 17)


def kanvas():
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    # Garis tipis di tepi, seperti bingkai kertas kerja.
    d.rectangle([24, 24, W - 25, H - 25], outline=LINE, width=1)
    return im, d


def merek(im, d):
    """Penanda kecil di sudut kiri atas: huruf V dua bidang."""
    x, y = 56, 52
    d.polygon([(x, y), (x + 16, y), (x + 32, y + 34), (x + 48, y), (x + 64, y),
               (x + 32, y + 58)], fill=TEXT)
    d.polygon([(x + 32, y + 58), (x + 48, y), (x + 64, y), (x + 32, y + 58)],
              fill=ACCENT)
    d.text((x + 82, y + 2), "NaoVert", font=f_meta, fill=DIM)


def bingkai(im, path, x, y, w, h, judul=None):
    """Tempel tangkapan layar dengan sudut membulat dan tepi halus."""
    shot = Image.open(path).convert("RGB")
    skala = min(w / shot.width, h / shot.height)
    nw, nh = int(shot.width * skala), int(shot.height * skala)
    shot = shot.resize((nw, nh), Image.LANCZOS)

    pad = 10
    bw, bh = nw + pad * 2, nh + pad * 2 + (28 if judul else 0)
    bx, by = x, y
    panel = Image.new("RGB", (bw, bh), BG_PANEL)
    pd = ImageDraw.Draw(panel)
    pd.rounded_rectangle([0, 0, bw - 1, bh - 1], radius=10, outline=LINE, width=1)
    if judul:
        pd.ellipse([14, 12, 21, 19], fill=(224, 122, 95))
        pd.ellipse([28, 12, 35, 19], fill=(214, 178, 92))
        pd.ellipse([42, 12, 49, 19], fill=(137, 170, 118))
        pd.text((bw - 14, 10), judul, font=f_meta, fill=DIM, anchor="ra")
    oy = pad + (28 if judul else 0)
    mask = Image.new("L", (nw, nh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, nw - 1, nh - 1], radius=5, fill=255)
    panel.paste(shot, (pad, oy), mask)
    im.paste(panel, (bx, by))
    return bw, bh


def judul_bawah(d, baris1, baris2=None):
    d.text((56, 566), baris1, font=f_bold_s, fill=TEXT)
    if baris2:
        d.text((56, 612), baris2, font=f_body, fill=DIM)


def adegan_1():
    im, d = kanvas()
    merek(im, d)
    d.text((56, 190), "Konversi berkas", font=f_bold, fill=TEXT)
    d.text((56, 256), "langsung dari Explorer.", font=f_bold, fill=ACCENT)
    d.text((56, 350), "Klik kanan satu berkas, pilih format, selesai.", font=f_light, fill=DIM)
    d.text((56, 392), "Hasilnya muncul di folder yang sama.", font=f_light, fill=DIM)
    d.line([56, 470, 456, 470], fill=LINE, width=1)
    d.text((56, 492), "13 keluarga berkas", font=f_meta, fill=TEXT)
    d.text((300, 492), "150 tujuan konversi", font=f_meta, fill=TEXT)
    d.text((572, 492), "144 ekstensi", font=f_meta, fill=TEXT)
    bingkai(im, os.path.join(SHOTS, "app-01.png"), 700, 150, 520, 420, "Dashboard")
    im.save(os.path.join(KELUAR, "1.png"))


def adegan_2():
    im, d = kanvas()
    merek(im, d)
    bingkai(im, os.path.join(SHOTS, "app-01.png"), 56, 96, 768, 500, "Dashboard, berkas menunggu")
    judul_bawah(d, "Semua format dalam satu jendela.",
                "Gambar, dokumen, media, data, arsip, font, vektor, CAD.")
    im.save(os.path.join(KELUAR, "2.png"))


def adegan_3():
    im, d = kanvas()
    merek(im, d)
    bingkai(im, os.path.join(SHOTS, "merge-filled.png"), 336, 92, 900, 500,
            "Gabung berkas")
    judul_bawah(d, "Banyak berkas jadi satu keluaran.",
                "PDF, DOCX, gambar, dan tabel bisa digabung dalam sekali jalan.")
    im.save(os.path.join(KELUAR, "3.png"))


def adegan_4():
    im, d = kanvas()
    merek(im, d)
    bingkai(im, os.path.join(SHOTS, "settings-shell.png"), 420, 96, 810, 480,
            "Pengaturan Explorer")
    judul_bawah(d, "Menu Explorer bisa dimatikan.",
                "Ikon baki, jalan otomatis, dan menu klik kanan diatur sendiri.")
    im.save(os.path.join(KELUAR, "4.png"))


def adegan_5():
    im, d = kanvas()
    merek(im, d)
    bingkai(im, os.path.join(SHOTS, "vector-open.png"), 120, 100, 1040, 470,
            "Vektor dan CAD")
    judul_bawah(d, "Vektor dan CAD ikut terbaca.",
                "DXF dan DWG dibaca tanpa mengubah berkas aslinya.")
    im.save(os.path.join(KELUAR, "5.png"))


def adegan_6():
    im, d = kanvas()
    # Penutup: lambang besar di tengah.
    cx, cy = W // 2, 250
    d.polygon([(cx - 92, cy - 78), (cx - 40, cy - 78), (cx, cy + 26),
               (cx + 40, cy - 78), (cx + 92, cy - 78), (cx, cy + 104)], fill=TEXT)
    d.polygon([(cx, cy + 104), (cx + 40, cy - 78), (cx + 92, cy - 78),
               (cx, cy + 104)], fill=ACCENT)
    d.text((cx, 400), "NaoVert", font=f_bold, fill=TEXT, anchor="ma")
    d.text((cx, 462), "Langganan 15 ribu per bulan. Bayar lewat QRIS.",
           font=f_light, fill=DIM, anchor="ma")
    d.line([cx - 170, 512, cx + 170, 512], fill=LINE, width=1)
    d.text((cx, 534), "naovert.sayba.id", font=f_body, fill=TEXT, anchor="ma")
    d.text((cx, 616), "Dibuat oleh Sayba Arc, Pontianak", font=f_meta, fill=DIM,
           anchor="ma")
    im.save(os.path.join(KELUAR, "6.png"))


for fn in (adegan_1, adegan_2, adegan_3, adegan_4, adegan_5, adegan_6):
    fn()
    print("ok", fn.__name__)
print("adegan di", KELUAR)
