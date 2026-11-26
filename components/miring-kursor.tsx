"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Pembungkus yang sedikit miring mengikuti kursor.
 *
 * Hanya mengubah dua variabel CSS, jadi tidak ada render ulang React sama
 * sekali. Kemiringannya dijepit pada 0,8 derajat: cukup untuk terasa sebagai
 * benda, tidak cukup untuk membuat gambar sulit dilihat.
 *
 * Di layar sentuh kelasnya tidak berbuat apa apa, karena CSS-nya dibatasi pada
 * perangkat dengan kursor presisi.
 */
export default function MiringKursor({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const kotak = useRef<HTMLDivElement>(null);

  const gerak = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = kotak.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // -0.5 sampai 0.5 dari titik tengah.
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--mx", (x * 1.6).toFixed(3));
    el.style.setProperty("--my", (y * 1.6).toFixed(3));
  };

  const pulih = () => {
    const el = kotak.current;
    if (!el) return;
    el.style.setProperty("--mx", "0");
    el.style.setProperty("--my", "0");
  };

  return (
    <div
      ref={kotak}
      onPointerMove={gerak}
      onPointerLeave={pulih}
      className={cn("miring-kursor", className)}
    >
      {children}
    </div>
  );
}
