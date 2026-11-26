"use client";
import { useEffect, useRef, useState } from "react";

type Opsi = IntersectionObserverInit & { once?: boolean };

/**
 * Menandai elemen saat masuk layar, dipakai untuk animasi muncul.
 *
 * Hanya memakai IntersectionObserver, tanpa pustaka animasi. Kalau peramban
 * tidak punya IntersectionObserver, isinya langsung dianggap terlihat supaya
 * tidak ada bagian halaman yang tertinggal tak terlihat.
 *
 * Opsi dipecah menjadi nilai nilai tunggal, bukan disimpan sebagai objek.
 * Kalau objek opsi dipakai langsung sebagai dependensi, objek itu dibuat baru
 * pada setiap render dan observernya dipasang ulang terus menerus.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options?: Opsi,
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  const once = options?.once ?? true;
  const threshold = options?.threshold ?? 0.12;
  const rootMargin = options?.rootMargin;
  const root = options?.root;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

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
      // rootMargin dan root hanya dikirim kalau ada isinya. Nilai undefined
      // membuat konstruktornya melempar, dan kalau itu terjadi di dalam efek,
      // seluruh animasi diam diam tidak pernah jalan.
      {
        threshold,
        ...(rootMargin ? { rootMargin } : {}),
        ...(root ? { root } : {}),
      },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin, root]);

  return { ref, inView };
}
