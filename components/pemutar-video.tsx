"use client";

import { useRef, useState } from "react";
import { media } from "@/lib/data";
import Ikon from "@/components/ikon";

/**
 * Pemutar presentasi.
 *
 * Video tidak dimuat sebelum ditekan. Poster yang tampil lebih dulu, dan
 * tombol tutupnya baru dilepas setelah pemutaran benar benar dimulai, jadi
 * tidak ada video 1,1 MB yang ikut terunduh hanya karena halaman dibuka.
 */
export default function PemutarVideo() {
  const [putar, setPutar] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  const mulai = () => {
    setPutar(true);
    // Tunggu satu bingkai supaya elemen video sempat terpasang.
    requestAnimationFrame(() => {
      video.current?.play().catch(() => {
        // Kalau peramban menolak memutar otomatis, kendali tetap ada di
        // elemen video, jadi pengguna bisa menekan tombol putar sendiri.
      });
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-garis bg-ink-2">
      <div className="relative aspect-video">
        <video
          ref={video}
          className="size-full object-cover"
          controls={putar}
          preload="none"
          playsInline
          poster={media.poster}
          width={1280}
          height={720}
        >
          <source src={media.video} type="video/mp4" />
          Peramban Anda tidak memutar video MP4.
          <a href={media.video}>Unduh berkas videonya</a>.
        </video>

        {!putar && (
          <button
            type="button"
            onClick={mulai}
            className="group absolute inset-0 grid place-items-center bg-ink/30 transition-colors hover:bg-ink/15"
            aria-label="Putar video presentasi NaoVert"
          >
            <span className="flex items-center gap-3 rounded-full bg-kertas px-5 py-2.5 text-[13.5px] font-semibold text-ink shadow-lg transition-transform group-hover:scale-[1.03]">
              <Ikon nama="putar" ukuran={17} />
              Putar presentasi
            </span>
            <span className="absolute bottom-4 right-4 rounded-full bg-ink/70 px-2.5 py-1 font-mono text-[11px] tracking-[0.08em] text-kertas-2/70 backdrop-blur">
              {media.durasi}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
