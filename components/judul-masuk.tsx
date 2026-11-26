"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Satu baris judul yang naik saat halaman siap.
 *
 * Dipisah per baris, bukan satu blok, karena satu blok besar yang naik
 * sekaligus terbaca sebagai halaman yang bergeser. Per baris, mata mengikuti
 * urutan baca dari atas ke bawah.
 *
 * Baris pertama dimulai setelah halaman benar benar siap (satu bingkai), jadi
 * animasinya terlihat, bukan selesai sebelum layar tergambar.
 */
export default function JudulMasuk({
  children,
  jeda = 0,
  redup = false,
}: {
  children: ReactNode;
  jeda?: number;
  redup?: boolean;
}) {
  const [tampil, setTampil] = useState(false);

  useEffect(() => {
    const kurangGerak = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (kurangGerak) {
      setTampil(true);
      return;
    }
    const id = requestAnimationFrame(() => setTampil(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <span
      className={cn(
        "baris-judul",
        tampil && "baris-judul-tampil",
        redup && "text-tinta-3",
      )}
      style={{ ["--tunda" as string]: `${jeda}ms` }}
    >
      {children}
    </span>
  );
}
