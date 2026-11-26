"use client";
import { useEffect, useRef, useState } from "react";

type Opsi = IntersectionObserverInit & { once?: boolean };

/**
 * Menandai elemen saat masuk layar, dipakai untuk animasi muncul.
 *
 * Hanya memakai IntersectionObserver, tanpa pustaka animasi. Kalau pengguna
 * memilih mengurangi gerakan, kelas animasinya tidak pernah dipasang, jadi
 * isi tetap terbaca seketika.
 */
export function useInView(options?: Opsi) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const { once = true, ...observerOptions } = options ?? {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Kalau peramban tidak punya IntersectionObserver, tampilkan saja.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: 0.12, ...observerOptions },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, observerOptions]);

  return { ref, inView };
}
