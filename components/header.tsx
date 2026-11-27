"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigasi, situs } from "@/lib/data";
import Ikon, { Tanda } from "@/components/ikon";
import { cn } from "@/lib/utils";

type Tema = "gelap" | "terang";

/**
 * Header.
 *
 * Bentuknya kapsul melayang: satu permukaan membulat yang mengambang di atas
 * isi halaman. Alasan bentuk ini hanya dipakai di sini: kapsul memisahkan alat
 * navigasi dari dokumen di bawahnya, dan karena mengambang ia tidak memakai
 * baris tata letak saat orang menggulir. Tombol, kartu, dan panel tetap
 * bersudut 6px supaya kapsul jadi satu satunya bentuk bulat di halaman.
 *
 * Dua keadaan, dan bedanya sengaja kecil: sebelum digulir kapsul lebih lebar
 * dan lebih tembus pandang, setelah digulir ia menyempit dan menjadi lebih
 * padat. Tujuannya menandai halaman sudah bergerak, bukan menarik perhatian.
 *
 * Di ponsel kapsulnya menyusut jadi satu baris dan menunya membuka panel di
 * bawahnya, bisa ditutup dengan Escape.
 */
export default function Header() {
  const [buka, setBuka] = useState(false);
  const [gulir, setGulir] = useState(false);
  const [tema, setTema] = useState<Tema>("gelap");
  const jalur = usePathname();

  useEffect(() => {
    const onScroll = () => setGulir(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setBuka(false), [jalur]);

  useEffect(() => {
    const dipasang = document.documentElement.dataset.tema;
    setTema(dipasang === "terang" ? "terang" : "gelap");
  }, []);

  useEffect(() => {
    if (!buka) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBuka(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [buka]);

  const gantiTema = () => {
    const berikut: Tema = tema === "gelap" ? "terang" : "gelap";
    setTema(berikut);
    if (berikut === "terang") {
      document.documentElement.dataset.tema = "terang";
    } else {
      delete document.documentElement.dataset.tema;
    }
    try {
      localStorage.setItem("naovert-tema", berikut);
    } catch {
      /* penyimpanan diblokir: pilihan tetap berlaku untuk halaman ini */
    }
  };

  const aktif = (href: string) =>
    href.startsWith("/#") ? false : jalur === href || jalur.startsWith(href + "/");

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div
        className={cn(
          "kapsul-nav mx-auto flex items-center justify-between gap-2 rounded-full border pl-2 pr-2",
          gulir ? "kapsul-padat" : "kapsul-lega",
        )}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-full py-1 pl-2.5 pr-1 text-tinta sm:pl-3"
        >
          <Tanda ukuran={22} />
          <span className="text-[15px] font-semibold tracking-[-0.025em]">{situs.nama}</span>
          <span className="hidden font-mono text-[10.5px] tracking-[0.06em] text-tinta-3 sm:inline">
            {situs.versi}
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Navigasi utama">
          {navigasi.map((n) => {
            const ini = aktif(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={ini ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[13.5px] transition-colors duration-200",
                  ini
                    ? "bg-timbul text-tinta"
                    : "text-tinta-2 hover:bg-timbul/60 hover:text-tinta",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={gantiTema}
            aria-label={tema === "gelap" ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
            className="grid size-10 place-items-center rounded-full text-tinta-2 transition-colors hover:bg-timbul hover:text-tinta"
          >
            <Ikon nama={tema === "gelap" ? "matahari" : "bulan"} ukuran={17} />
          </button>

          <Link
            href="/unduh"
            className="hidden h-10 items-center justify-center rounded-full bg-tinta px-5 text-[13.5px] font-semibold tracking-[-0.006em] text-latar transition-colors hover:bg-tinta-2 sm:inline-flex"
          >
            Unduh
          </Link>

          <button
            type="button"
            onClick={() => setBuka((v) => !v)}
            aria-expanded={buka}
            aria-controls="menu-ponsel"
            aria-label={buka ? "Tutup menu" : "Buka menu"}
            className="grid size-10 place-items-center rounded-full text-tinta-2 transition-colors hover:bg-timbul hover:text-tinta md:hidden"
          >
            <Ikon nama={buka ? "tutup" : "menu"} ukuran={19} />
          </button>
        </div>
      </div>

      {buka && (
        <div
          id="menu-ponsel"
          className="kapsul-menu mx-auto mt-2 overflow-hidden rounded-[22px] border border-garis-2 bg-latar/95 p-2 backdrop-blur-lg md:hidden"
        >
          <nav className="flex flex-col" aria-label="Navigasi ponsel">
            {navigasi.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setBuka(false)}
                className={cn(
                  "rounded-full px-4 py-3 text-[15px] transition-colors",
                  aktif(n.href)
                    ? "bg-timbul text-tinta"
                    : "text-tinta-2 hover:bg-timbul/60 hover:text-tinta",
                )}
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/unduh"
              onClick={() => setBuka(false)}
              className="mt-1.5 flex h-11 items-center justify-center gap-2 rounded-full bg-tinta text-[14.5px] font-semibold text-latar"
            >
              Unduh NaoVert
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}