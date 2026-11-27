"use client";

import { useRef, useState } from "react";
import { media } from "@/lib/data";
import Ikon from "@/components/ikon";

/**
 * Pemutar panduan.
 *
 * Video tidak diunduh sebelum ditekan. Yang tampil lebih dulu hanya poster,
 * jadi 3,2 MB tidak ikut terkirim ke setiap orang yang membuka beranda dan
 * tidak jadi menonton.
 */
export default function PemutarVideo() {
  const [putar, setPutar] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  const mulai = () => {
    setPutar(true);
    // Tunggu satu bingkai supaya kendali video sempat terpasang.
    requestAnimationFrame(() => {
      video.current?.play().catch(() => {
        // Kalau peramban menolak memutar otomatis, kendali sudah terpasang,
        // jadi pengguna bisa menekan tombol putar sendiri.
      });
    });
  };

  return (
    <figure className="m-0">
      <div className="relative overflow-hidden rounded-2xl border border-garis bg-panel shadow-[var(--bayang-kartu)]">
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
              className="group absolute inset-0 grid place-items-center bg-latar/25 transition-colors hover:bg-latar/10"
              aria-label="Putar video panduan pemakaian NaoVert"
            >
              <span className="flex items-center gap-2.5 rounded-full border border-garis-2 bg-tinta px-4 py-2.5 text-[13.5px] font-semibold text-latar transition-transform group-hover:scale-[1.02]">
                <Ikon nama="main" ukuran={15} />
                Putar panduan
              </span>
              <span className="absolute bottom-3.5 right-3.5 rounded-sm bg-latar/75 px-2 py-1 font-mono text-[11px] tracking-[0.08em] text-tinta-2 backdrop-blur-sm">
                {media.durasi}
              </span>
            </button>
          )}
        </div>
      </div>

      <figcaption className="mt-2.5 text-[12.5px] text-tinta-3">
        Rekaman langsung dari aplikasi NaoVert versi terbaru.
      </figcaption>
    </figure>
  );
}
