"use client";

import { useEffect, useRef } from "react";

/**
 * Garis kemajuan baca di paling atas jendela.
 *
 * Panjangnya mengikuti bagian halaman yang sudah lewat, dihitung dari posisi
 * gulir. Tidak ada state React di sini: nilainya ditulis langsung ke gaya
 * elemen lewat requestAnimationFrame, supaya menggulir tidak memicu render
 * ulang seluruh pohon komponen.
 *
 * Kalau halaman muat dalam satu layar, garisnya tidak berguna, jadi
 * disembunyikan.
 */
export default function KemajuanBaca() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let id = 0;
    const hitung = () => {
      id = 0;
      const doc = document.documentElement;
      const bisa = doc.scrollHeight - window.innerHeight;
      const maju = bisa > 0 ? Math.min(1, Math.max(0, window.scrollY / bisa)) : 0;
      el.style.setProperty("--maju", maju.toFixed(4));
      el.style.opacity = bisa > 120 ? "1" : "0";
    };
    const jadwalkan = () => {
      if (id) return;
      id = requestAnimationFrame(hitung);
    };

    hitung();
    window.addEventListener("scroll", jadwalkan, { passive: true });
    window.addEventListener("resize", jadwalkan);
    return () => {
      window.removeEventListener("scroll", jadwalkan);
      window.removeEventListener("resize", jadwalkan);
      if (id) cancelAnimationFrame(id);
    };
  }, []);

  return <div ref={ref} className="kemajuan-baca" aria-hidden="true" />;
}
