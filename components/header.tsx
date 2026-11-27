"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { situs } from "@/lib/data";
import Ikon, { Tanda } from "@/components/ikon";
import { cn } from "@/lib/utils";

type Grup = {
  label: string;
  href: string;
  sub?: { judul: string; isi: string; href: string }[];
};

const menu: Grup[] = [
  {
    label: "Tentang",
    href: "/tentang",
  },
  {
    label: "Fitur",
    href: "/fitur",
    sub: [
      {
        judul: "Semua fitur",
        isi: "Tab, kategori, dan cara kerja aplikasi.",
        href: "/fitur",
      },
      {
        judul: "Kategori berkas",
        isi: "Tiga belas keluarga format yang dikenali.",
        href: "/#kategori",
      },
      {
        judul: "Matriks format",
        isi: "Cari format masuk dan tujuannya.",
        href: "/format",
      },
      {
        judul: "Klik kanan Explorer",
        isi: "Konversi langsung dari File Explorer.",
        href: "/fitur#klik-kanan",
      },
    ],
  },
  {
    label: "Pelajari",
    href: "/panduan",
    sub: [
      {
        judul: "Panduan pemakaian",
        isi: "Tiga langkah dari pemasang sampai hasil.",
        href: "/panduan",
      },
      {
        judul: "Lisensi bulanan",
        isi: "Aktif 30 hari, tanpa perpanjangan otomatis.",
        href: "/harga/bulanan",
      },
      {
        judul: "Lisensi tahunan",
        isi: "Promo setara sepuluh bulan.",
        href: "/harga/tahunan",
      },
      {
        judul: "Bayar dengan QRIS",
        isi: "Buat pesanan dan pindai kode.",
        href: "/harga/bayar",
      },
    ],
  },
  { label: "Harga", href: "/harga" },
  { label: "Unduh", href: "/unduh" },
];

export default function Header() {
  const [buka, setBuka] = useState(false);
  const [grupBuka, setGrupBuka] = useState<string | null>(null);
  const jalur = usePathname();

  useEffect(() => {
    setBuka(false);
    setGrupBuka(null);
  }, [jalur]);

  useEffect(() => {
    if (!buka) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBuka(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [buka]);

  const aktif = (href: string) =>
    href === "/" ? jalur === "/" : jalur === href || jalur.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-garis bg-latar/92 backdrop-blur-md supports-[backdrop-filter]:bg-latar/80">
      <div className="wadah flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex min-h-11 shrink-0 items-center gap-2 text-tinta"
            aria-label={`${situs.nama}, kembali ke beranda`}
          >
            <Tanda ukuran={26} />
            <span className="text-[17px] font-semibold tracking-[-0.02em]">{situs.nama}</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {menu.map((m) => {
              const ini = aktif(m.href);
              if (!m.sub) {
                return (
                  <Link
                    key={m.href}
                    href={m.href}
                    aria-current={ini ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-full px-3 text-[14px] transition-colors",
                      ini ? "font-semibold text-tinta" : "text-tinta-2 hover:bg-timbul hover:text-tinta",
                    )}
                  >
                    {m.label}
                  </Link>
                );
              }
              return (
                <div key={m.href} className="group relative">
                  <Link
                    href={m.href}
                    className={cn(
                      "inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-[14px] transition-colors",
                      ini ? "font-semibold text-tinta" : "text-tinta-2 hover:bg-timbul hover:text-tinta",
                    )}
                  >
                    {m.label}
                    <span className="text-tinta-3 transition-transform group-hover:rotate-180">
                      <Ikon nama="panah" ukuran={13} className="rotate-90" />
                    </span>
                  </Link>
                  <div className="invisible absolute left-0 top-full w-[420px] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="overflow-hidden rounded-2xl border border-garis bg-panel p-2 shadow-[var(--bayang-timbul)]">
                      {m.sub.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          onClick={(e) => e.currentTarget.blur()}
                          className="block rounded-xl px-4 py-3 transition-colors hover:bg-timbul"
                        >
                          <span className="block text-[13.5px] font-semibold text-tinta">
                            {s.judul}
                          </span>
                          <span className="mt-0.5 block text-[12.5px] leading-relaxed text-tinta-3">
                            {s.isi}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/unduh"
            className="hidden h-10 items-center justify-center gap-2 rounded-full bg-tinta px-4 text-[13.5px] font-semibold tracking-[-0.006em] text-latar transition hover:opacity-90 sm:inline-flex"
          >
            <Ikon nama="unduh" ukuran={16} />
            Unduh untuk Windows
          </Link>

          <button
            type="button"
            onClick={() => setBuka(true)}
            aria-expanded={buka}
            aria-controls="menu-ponsel"
            aria-label="Buka menu"
            className="grid size-11 place-items-center rounded-full text-tinta-2 transition-colors hover:bg-timbul hover:text-tinta lg:hidden"
          >
            <Ikon nama="menu" ukuran={20} />
          </button>
        </div>
      </div>

      {buka && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-latar lg:hidden">
          <div className="wadah flex h-16 shrink-0 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-tinta" onClick={() => setBuka(false)}>
              <Tanda ukuran={26} />
              <span className="text-[17px] font-semibold tracking-[-0.02em]">{situs.nama}</span>
            </Link>
            <button
              type="button"
              onClick={() => setBuka(false)}
              aria-label="Tutup menu"
              className="grid size-11 place-items-center rounded-full text-tinta-2 transition-colors hover:bg-timbul hover:text-tinta"
            >
              <Ikon nama="tutup" ukuran={20} />
            </button>
          </div>

          <nav
            id="menu-ponsel"
            className="wadah flex-1 overflow-y-auto pb-10 pt-4"
            aria-label="Navigasi ponsel"
          >
            {menu.map((m) => {
              if (!m.sub) {
                return (
                  <Link
                    key={m.href}
                    href={m.href}
                    onClick={() => setBuka(false)}
                    className="flex min-h-14 items-center justify-between border-b border-garis text-[20px] font-semibold tracking-[-0.02em] text-tinta"
                  >
                    {m.label}
                  </Link>
                );
              }
              const terbuka = grupBuka === m.href;
              return (
                <div key={m.href} className="border-b border-garis">
                  <button
                    type="button"
                    aria-expanded={terbuka}
                    onClick={() => setGrupBuka(terbuka ? null : m.href)}
                    className="flex min-h-14 w-full items-center justify-between text-[20px] font-semibold tracking-[-0.02em] text-tinta"
                  >
                    {m.label}
                    <span
                      className={cn(
                        "text-tinta-3 transition-transform",
                        terbuka && "rotate-45",
                      )}
                    >
                      <Ikon nama="tutup" ukuran={18} />
                    </span>
                  </button>
                  {terbuka && (
                    <div className="pb-3">
                      {m.sub.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          onClick={() => setBuka(false)}
                          className="flex min-h-12 flex-col justify-center rounded-xl px-3 py-2 text-tinta-2 hover:bg-timbul"
                        >
                          <span className="text-[15px] font-medium text-tinta">{s.judul}</span>
                          <span className="text-[12.5px] text-tinta-3">{s.isi}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <Link
              href="/unduh"
              onClick={() => setBuka(false)}
              className="tombol mt-6 w-full"
            >
              <Ikon nama="unduh" ukuran={18} />
              Unduh untuk Windows
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
