"use client";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

/**
 * Penanda bagian berjalan.
 *
 * Garis pendek di kiri label yang memanjang saat bagiannya masuk layar. Satu
 * gerak saja untuk seluruh situs, supaya setiap bagian terasa dibuka dengan
 * cara yang sama, bukan masing masing punya gaya sendiri.
 */
export default function LabelGaris({ children }: { children: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.5 });

  return (
    <span
      ref={ref}
      className={cn("label label-garis", inView && "label-garis-tampil")}
    >
      {children}
    </span>
  );
}
