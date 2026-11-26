"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigasi, situs } from "@/lib/data";
import Ikon, { Tanda } from "@/components/ikon";
import { cn } from "@/lib/utils";

/**
 * Header kapsul melayang.
 *
 * Kapsul mengambang di atas isi, bukan menempel sebagai bilah penuh. Saat
 * halaman digulir, kapsulnya menebal sedikit supaya tetap terbaca di atas
 * gambar tangkapan layar yang terang. Di ponsel menu dibuka sebagai panel di
 * bawah kapsul, dan bisa ditutup dengan Escape.
 */
export default function Header() {
  const [buka, setBuka] = useState(false);
  const [gulir, setGulir] = useState(false);
  const jalur = usePathname();

  useEffect(() => {
    const onScroll = () => setGulir(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setBuka(false), [jalur]);

  useEffect(() => {
    if (!buka) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBuka(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [buka]);

  const aktif = (href: string) =>
    href.startsWith("/#") ? false : jalur === href || jalur.startsWith(href + "/");

  return (
    <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      <div className="wadah pt-4 md:pt-6">
        <div
          className={cn(
            "pointer-events-auto rounded-2xl md:rounded-full border transition-all duration-300",
            "bg-ink-2/85 backdrop-blur-xl",
            gulir
              ? "border-garis-2 shadow-[0_10px_34px_rgba(0,0,0,0.55)]"
              : "border-garis shadow-[0_4px_20px_rgba(0,0,0,0.35)]",
          )}
        >
          <div className="flex h-14 items-center justify-between pl-4 pr-2">
            <Link href="/" className="flex shrink-0 items-center gap-2.5">
              <span className="text-kertas">
                <Tanda ukuran={24} />
              </span>
              <span className="text-[15px] font-semibold tracking-[-0.02em]">{situs.nama}</span>
              <span className="hidden text-[11px] tracking-[0.14em] text-kertas-2/40 sm:inline">
                {situs.versi}
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
              {navigasi.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[13.5px] transition-colors",
                    aktif(n.href)
                      ? "text-kertas"
                      : "text-kertas-2/60 hover:text-kertas",
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1.5">
              <Link
                href="/unduh"
                className="hidden rounded-full bg-kertas px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-kertas-2 sm:inline-flex"
              >
                Unduh
              </Link>
              <button
                type="button"
                onClick={() => setBuka((v) => !v)}
                aria-expanded={buka}
                aria-controls="menu-ponsel"
                aria-label={buka ? "Tutup menu" : "Buka menu"}
                className="grid size-10 place-items-center rounded-full text-kertas-2/70 transition-colors hover:bg-white/5 hover:text-kertas md:hidden"
              >
                <Ikon nama={buka ? "tutup" : "menu"} />
              </button>
            </div>
          </div>

          {buka && (
            <div id="menu-ponsel" className="border-t border-garis px-3 pb-3 pt-2 md:hidden">
              <nav className="flex flex-col" aria-label="Navigasi ponsel">
                {navigasi.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setBuka(false)}
                    className="rounded-xl px-3 py-2.5 text-[15px] text-kertas-2/75 transition-colors hover:bg-white/5 hover:text-kertas"
                  >
                    {n.label}
                  </Link>
                ))}
                <Link
                  href="/unduh"
                  onClick={() => setBuka(false)}
                  className="mt-2 rounded-xl bg-kertas px-3 py-2.5 text-center text-[14px] font-semibold text-ink"
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
