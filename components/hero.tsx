"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { tangkapan } from "@/lib/data";
import Ikon from "@/components/ikon";

/**
 * Pembuka beranda.
 *
 * Meniru mekanisme acuan ikhtisar apa adanya: judul di atas halaman, lalu satu
 * panggung yang dipin. Selama digulir, akordeon tiga wajah aplikasi masuk dari
 * kiri, garis kemajuannya terisi satu per satu, dan layar aplikasi berganti
 * dengan crossfade sambil bergeser pelan. Semua nilai dihitung dari satu
 * pendengar gulir; tidak ada pustaka animasi.
 */

const kataBerganti = ["gambar", "dokumen", "video", "audio", "tabel", "berkas"];

type Mode = {
  id: string;
  nama: string;
  ringkas: string;
  isi: string;
  gambar: string;
  alt: string;
};

const mode: Mode[] = [
  {
    id: "konversi",
    nama: "Konversi",
    ringkas: "Seret berkas, pilih tujuan, jalankan.",
    isi: "Gambar, dokumen, video, audio, tabel, e-book, arsip, font, vektor, dan gambar teknik dalam satu jendela. Format tujuan hanya menampilkan yang benar benar bisa ditulis.",
    gambar: tangkapan.berkas,
    alt: "Jendela NaoVert berisi beberapa berkas dengan pilihan format tujuan.",
  },
  {
    id: "antrean",
    nama: "Antrean",
    ringkas: "Banyak berkas berjalan bersamaan.",
    isi: "Setiap berkas punya barisnya sendiri: mesin yang dipakai, persentase, dan hasilnya. Yang gagal bisa diulang tanpa mengulang antrean dari awal.",
    gambar: tangkapan.proses,
    alt: "Daftar antrean konversi NaoVert dengan bar kemajuan per berkas.",
  },
  {
    id: "hasil",
    nama: "Hasil",
    ringkas: "Berkas baru di folder yang sama.",
    isi: "Berkas asli tidak pernah diubah. Hasil ditulis sebagai berkas baru di sampingnya, dengan nama berbeda, jadi selalu ada salinan yang aman.",
    gambar: tangkapan.selesai,
    alt: "Ringkasan hasil konversi NaoVert dengan tombol buka folder.",
  },
];

function Kata({ t, d }: { t: string; d: number }) {
  return (
    <span className="hero-kata" style={{ "--tunda": `${d}ms` } as React.CSSProperties}>
      {t}
    </span>
  );
}

function KataBerganti() {
  const [indeks, setIndeks] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const jam = window.setInterval(
      () => setIndeks((i) => (i + 1) % kataBerganti.length),
      3400,
    );
    return () => window.clearInterval(jam);
  }, []);

  const kata = kataBerganti[indeks];

  return (
    <span className="relative inline-block whitespace-nowrap text-tembaga-teks">
      {Array.from(kata).map((huruf, i) => (
        <span
          key={`${kata}-${i}`}
          className="hero-huruf"
          style={{ "--i": i } as React.CSSProperties}
        >
          {huruf}
        </span>
      ))}
      <svg
        className="hero-coret absolute -bottom-1.5 left-0 w-full text-tembaga"
        viewBox="0 0 200 14"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ "--panjang": "200" } as React.CSSProperties}
      >
        <path
          d="M3 10C40 4 80 3 120 6c30 2 55 4 77 2"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export default function Hero() {
  const kolase = useRef<HTMLDivElement>(null);
  const trek = useRef<HTMLDivElement>(null);
  const garis = useRef<(HTMLSpanElement | null)[]>([]);
  const [aktif, setAktif] = useState(0);

  useEffect(() => {
    const el = trek.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let id = 0;
    let lalu = -1;
    const hitung = () => {
      id = 0;
      const r = el.getBoundingClientRect();
      const total = Math.max(r.height - window.innerHeight, 1);
      const p = Math.min(Math.max(-r.top / total, 0), 1);

      /* Urutan acuan, tanpa dilangkahi: satu, layar membesar dari 0,955 ke 1.
       * Dua, akordeon masuk dari kiri. Tiga, wajah berganti dengan garis
       * kemajuan. */
      const tumbuh = Math.min(Math.max(p / 0.12, 0), 1);
      el.style.setProperty("--s", String(0.955 + tumbuh * 0.045));
      el.style.setProperty("--ak", String(Math.min(Math.max((p - 0.1) / 0.06, 0), 1)));

      const maju = Math.min(Math.max((p - 0.16) / 0.84, 0), 1) * mode.length;
      const indeks = Math.min(Math.floor(maju), mode.length - 1);
      if (indeks !== lalu) {
        lalu = indeks;
        setAktif(indeks);
      }
      garis.current.forEach((g, i) => {
        if (g) g.style.transform = `scaleX(${Math.min(Math.max(maju - i, 0), 1)})`;
      });

      if (kolase.current) {
        kolase.current.style.setProperty("--gulir", String(Math.min(window.scrollY, 640)));
      }
    };
    const jadwalkan = () => {
      if (id) return;
      id = requestAnimationFrame(() => {
        id = 0;
        hitung();
      });
      window.setTimeout(() => {
        if (id) {
          cancelAnimationFrame(id);
          hitung();
        }
      }, 120);
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

  return (
    <section className="relative">
      <div className="relative overflow-x-clip pb-12 pt-16 md:pb-16 md:pt-24">
        <div ref={kolase} className="hero-kolase pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="hero-lapisan absolute left-[3%] top-[12%] text-tinta-3/30 md:left-[8%] md:top-[18%]" style={{ "--laju": "0.12" } as React.CSSProperties}>
            <div className="hero-kartu" style={{ "--tunda": "120ms", "--dari-x": "-9rem" } as React.CSSProperties}>
              <Ikon nama="dokumen" ukuran={112} strokeWidth={0.7} />
            </div>
          </div>
          <div className="hero-lapisan absolute right-[4%] top-[10%] hidden text-tinta-3/25 md:block md:right-[9%]" style={{ "--laju": "-0.06" } as React.CSSProperties}>
            <div className="hero-kartu" style={{ "--tunda": "220ms", "--dari-x": "9.5rem" } as React.CSSProperties}>
              <Ikon nama="lapis" ukuran={150} strokeWidth={0.6} />
            </div>
          </div>
          <div className="hero-lapisan absolute left-[6%] top-[64%] hidden text-tinta-3/25 lg:block" style={{ "--laju": "0.1" } as React.CSSProperties}>
            <div className="hero-kartu" style={{ "--tunda": "520ms", "--dari-x": "-7rem" } as React.CSSProperties}>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-garis bg-panel px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-tinta-2 shadow-[var(--bayang-kartu)]">
                docx <span className="text-tinta-3">→</span> pdf
              </span>
            </div>
          </div>
          <div className="hero-lapisan absolute right-[6%] top-[58%] hidden text-tinta-3/25 lg:block" style={{ "--laju": "0.07" } as React.CSSProperties}>
            <div className="hero-kartu" style={{ "--tunda": "640ms", "--dari-x": "7rem" } as React.CSSProperties}>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-garis bg-panel px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-tinta-2 shadow-[var(--bayang-kartu)]">
                heic <span className="text-tinta-3">→</span> jpg
              </span>
            </div>
          </div>
        </div>

        <div className="wadah relative">
          <div className="mx-auto text-center">
            <h1 className="mx-auto text-center text-[clamp(2.15rem,10.5vw,4.8rem)] font-bold leading-[1.02] tracking-[-0.047em] [max-inline-size:7.9em] [text-wrap:pretty] lg:text-[clamp(3.6rem,6.95vw,5.6rem)] lg:[max-inline-size:7.61em]">
              <Kata t="Satu" d={0} /> <Kata t="aplikasi" d={70} />{" "}
              <Kata t="untuk" d={150} /> <KataBerganti />{" "}
              <Kata t="dan" d={310} /> <Kata t="semua" d={350} />{" "}
              <Kata t="berkas" d={390} /> <Kata t="lain." d={430} />
            </h1>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 opacity-0 [animation:hero-naik_900ms_cubic-bezier(0.16,1,0.3,1)_520ms_forwards] md:mt-[37.709px]">
              <Link
                href="/unduh"
                className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full bg-tinta px-5 text-[14px] font-medium leading-none text-latar transition hover:opacity-90"
              >
                Unduh untuk Windows
              </Link>
              <Link
                href="/harga"
                className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full px-5 text-[14px] font-medium leading-none text-tinta shadow-[inset_0_0_0_1px_var(--garis-2)] transition hover:bg-timbul"
              >
                Lihat harga
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={trek}
        className="relative lg:h-[160svh]"
        style={{ "--s": "0.955", "--ak": "0" } as React.CSSProperties}
      >
        <div className="flex min-h-svh items-center overflow-x-clip py-12 lg:sticky lg:top-0 lg:h-svh lg:overflow-hidden lg:py-0">
          <div className="panggung-skala w-full origin-center">
            <div className="mx-auto w-full max-w-[86rem] px-6">
              <div className="relative flex flex-col lg:block">
                <div className="relative order-1 w-full lg:mx-auto lg:w-[71.621%]">
                  <div className="tampilan-aplikasi relative aspect-[2562/1642]">
                    {mode.map((m, i) => (
                      <Image
                        key={m.id}
                        src={m.gambar}
                        alt={m.alt}
                        width={2480}
                        height={1560}
                        sizes="(max-width: 1024px) 100vw, 62vw"
                        className="absolute inset-0 size-full object-cover transition-opacity duration-500"
                        style={{ opacity: i === aktif ? 1 : 0 }}
                        aria-hidden={i !== aktif}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative z-10 order-2 mt-8 lg:absolute lg:left-[15.7%] lg:top-1/2 lg:mt-0 lg:w-[19.5rem] lg:-translate-y-1/2">
                  <div
                    role="group"
                    aria-label="Bagian aplikasi"
                    className="panggung-isi lg:bg-latar lg:py-6 lg:pr-8"
                    style={{
                      opacity: "var(--ak, 0)",
                      transform: "translateX(calc((1 - var(--ak, 0)) * -2.5rem))",
                    }}
                  >
                    {mode.map((m, i) => {
                      const ini = i === aktif;
                      return (
                        <div key={m.id} className="relative border-t border-garis first:border-t-0">
                          <span
                            aria-hidden="true"
                            ref={(n) => {
                              garis.current[i] = n;
                            }}
                            className="absolute inset-x-0 top-0 h-px origin-left bg-tembaga"
                            style={{ transform: "scaleX(0)" }}
                          />
                          <div className="py-5">
                            <p
                              className="origin-left text-[1.4rem] font-medium leading-tight tracking-[-0.03em] transition-all duration-300"
                              style={{ transform: `scale(${ini ? 1 : 0.72})`, opacity: ini ? 1 : 0.4 }}
                            >
                              {m.nama}
                            </p>
                            <div
                              className="grid transition-all duration-300"
                              style={{ gridTemplateRows: ini ? "1fr" : "0fr", opacity: ini ? 1 : 0 }}
                            >
                              <div className="overflow-hidden">
                                <div className="flex flex-col gap-3 pt-3">
                                  <p className="text-[13.5px] font-semibold text-tinta">{m.ringkas}</p>
                                  <p className="text-[13.5px] leading-relaxed text-tinta-2">{m.isi}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
