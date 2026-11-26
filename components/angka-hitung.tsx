"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

/**
 * Angka yang berjalan naik saat masuk layar.
 *
 * Hanya angka di dalam teks yang dihitung; satuan dan tanda baca di
 * sekitarnya dibiarkan apa adanya. Contoh: "183" naik dari 0, tetapi "6,5"
 * tetap ditulis dengan koma karena itu tanda desimal yang dipakai di sini.
 *
 * Angkanya dihitung sekali saja. Mengulang hitungan setiap kali digulir balik
 * akan terasa seperti angka yang tidak bisa dipercaya.
 *
 * Kalau pengguna memilih mengurangi gerakan, angka langsung tampil penuh.
 */
export default function AngkaHitung({
  nilai,
  className,
  durasi = 1100,
}: {
  nilai: string | number;
  className?: string;
  durasi?: number;
}) {
  const teks = String(nilai);
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [tampil, setTampil] = useState<string>("0");
  const sudah = useRef(false);

  // Angka sasaran dan bagian yang bukan angka dipisahkan sekali.
  const cocok = teks.match(/^([^\d]*)([\d.]+)(.*)$/);
  const depan = cocok?.[1] ?? "";
  const sasaran = cocok ? Number(cocok[2].replace(/\./g, "")) : 0;
  const belakang = cocok?.[3] ?? "";

  useEffect(() => {
    if (!inView || sudah.current) return;

    const kurangGerak = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (kurangGerak || !cocok) {
      setTampil(teks);
      sudah.current = true;
      return;
    }

    sudah.current = true;
    const mulai = performance.now();

    const langkah = (kini: number) => {
      const maju = Math.min(1, (kini - mulai) / durasi);
      // Pelambatan di ujung, supaya angka mendarat dan tidak berhenti mendadak.
      const halus = 1 - Math.pow(1 - maju, 3);
      setTampil(String(Math.round(sasaran * halus)));
      if (maju < 1) requestAnimationFrame(langkah);
    };

    requestAnimationFrame(langkah);
  }, [inView, teks, sasaran, durasi, cocok]);

  // Sebelum terlihat, angkanya sudah ditulis penuh di DOM supaya mesin pencari
  // dan pembaca layar membaca nilai yang benar, bukan nol.
  return (
    <span
      ref={ref}
      className={cn("hitung-angka", className)}
      aria-label={teks}
    >
      <span aria-hidden="true">
        {depan}
        {sudah.current ? tampil : "0"}
        {belakang}
      </span>
    </span>
  );
}
