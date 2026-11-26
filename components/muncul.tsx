"use client";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Pembungkus animasi muncul.
 *
 * Dipakai sebagai elemen blok biasa supaya tata letak tidak bergantung pada
 * JavaScript. Kalau skrip gagal dimuat, isinya tetap ada di halaman; hanya
 * animasinya yang tidak jalan.
 */
export default function Muncul({
  children,
  className,
  jeda = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  jeda?: number;
  as?: "div" | "section" | "li" | "article" | "figure";
}) {
  const { ref, inView } = useInView();

  return (
    <Tag
      ref={ref as never}
      className={cn("masuk", inView && "masuk-tampil", className)}
      style={jeda ? { transitionDelay: `${jeda}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
