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
 * Bilah penuh, bukan kapsul melayang: kapsul dengan sudut pil adalah bentuk
 * yang dipakai acuan, sedangkan aplikasi NaoVert memakai sudut tegas dan
 * permukaan penuh. Saat digulir, bilahnya menebal garisnya saja, tidak
 * mengambang.
 *
 * Di ponsel menu dibuka di bawah bilah dan bisa ditutup dengan Escape.
 *
 * Pengalih tema ada di sini karena situs ini punya dua tema yang keduanya
 * bekerja. Pilihannya disimpan di localStorage dan dipasang sebelum halaman
 * dilukis oleh skrip kecil di app/layout.tsx, sehingga tidak ada kedipan.
 */
export default function Header() {
  const [buka, setBuka] = useState(false);
  const [gulir, setGulir] = useState(false);
  const [tema, setTema] = useState<Tema>("gelap");
  const jalur = usePathname();

  useEffect(() => {
    const onScroll = () => setGulir(window.scrollY > 6);
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
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "border-b transition-colors duration-200",
          gulir
            ? "border-garis bg-latar/92 backdrop-blur-md"
            : "border-transparent bg-latar",
        )}
      >
        <div className="wadah">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex shrink-0 items-center gap-2.5">
              <Tanda ukuran={23} />
              <span className="text-[15.5px] font-semibold tracking-[-0.02em]">
                {situs.nama}
              </span>
              <span className="hidden font-mono text-[11px] tracking-[0.06em] text-tinta-3 sm:inline">
                {situs.versi}
              </span>
            </Link>

            <nav className="hidden items-center gap-0.5 md:flex" aria-label="Navigasi utama">
              {navigasi.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "px-3 py-2 text-[13.5px] transition-colors",
                    aktif(n.href)
                      ? "text-tinta"
                      : "text-tinta-2 hover:text-tinta",
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={gantiTema}
                aria-label={
                  tema === "gelap" ? "Ganti ke tema terang" : "Ganti ke tema gelap"
                }
                className="grid size-9 place-items-center rounded-md text-tinta-2 transition-colors hover:bg-timbul hover:text-tinta"
              >
                <Ikon nama={tema === "gelap" ? "matahari" : "bulan"} ukuran={17} />
              </button>

              <Link href="/unduh" className="tombol hidden sm:inline-flex">
                Unduh
              </Link>

              <button
                type="button"
                onClick={() => setBuka((v) => !v)}
                aria-expanded={buka}
                aria-controls="menu-ponsel"
                aria-label={buka ? "Tutup menu" : "Buka menu"}
                className="grid size-9 place-items-center rounded-md text-tinta-2 transition-colors hover:bg-timbul hover:text-tinta md:hidden"
              >
                <Ikon nama={buka ? "tutup" : "menu"} ukuran={19} />
              </button>
            </div>
          </div>

          {buka && (
            <div id="menu-ponsel" className="border-t border-garis pb-3 pt-2 md:hidden">
              <nav className="flex flex-col" aria-label="Navigasi ponsel">
                {navigasi.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setBuka(false)}
                    className="rounded-md px-2 py-2.5 text-[15px] text-tinta-2 transition-colors hover:bg-timbul hover:text-tinta"
                  >
                    {n.label}
                  </Link>
                ))}
                <Link
                  href="/unduh"
                  onClick={() => setBuka(false)}
                  className="tombol mt-2"
                >
                  Unduh NaoVert
                </Link>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
