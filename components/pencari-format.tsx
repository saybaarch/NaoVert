"use client";

import { useMemo, useState } from "react";
import { keluarga, jumlahEkstensi, jumlahTujuan } from "@/lib/data";
import Ikon from "@/components/ikon";
import { cn } from "@/lib/utils";

/**
 * Daftar format dengan pencarian.
 *
 * Pencarian menyaring tiga hal sekaligus: nama kategori, ekstensi masukan,
 * dan ekstensi keluaran. Orang biasanya datang dengan satu berkas di tangan,
 * jadi mengetik "heic" atau "docx" harus langsung menemukan jawabannya.
 */
export default function PencariFormat() {
  const [kata, setKata] = useState("");
  const [buka, setBuka] = useState<string | null>(null);

  const hasil = useMemo(() => {
    const q = kata.trim().toLowerCase();
    if (!q) return keluarga;
    return keluarga
      .map((k) => {
        const cocokMasuk = k.masuk.filter((e) => e.toLowerCase().includes(q));
        const cocokKeluar = k.keluar.filter((e) => e.toLowerCase().includes(q));
        const cocokJudul = k.judul.toLowerCase().includes(q);
        return { ...k, cocokMasuk, cocokKeluar, cocokJudul };
      })
      .filter(
        (k) => k.cocokJudul || k.cocokMasuk.length > 0 || k.cocokKeluar.length > 0,
      );
  }, [kata]);

  const total = hasil.length;

  return (
    <div>
      <div className="sticky top-20 z-20 -mx-1 mb-8 bg-ink/85 px-1 py-3 backdrop-blur-xl">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-kertas-2/35">
            <Ikon nama="panah" ukuran={16} />
          </span>
          <input
            type="search"
            value={kata}
            onChange={(e) => setKata(e.target.value)}
            placeholder="Ketik nama format, misalnya pdf, heic, atau docx"
            aria-label="Cari format"
            className="h-12 w-full rounded-full border border-garis-2 bg-ink-2 pl-11 pr-4 text-[14.5px] text-kertas placeholder:text-kertas-2/30 focus:border-kertas-2/40 focus:outline-none"
          />
        </div>
        <p className="mt-2.5 pl-1 text-[12px] text-kertas-2/40">
          {kata
            ? `${total} kategori cocok dengan "${kata}"`
            : `${keluarga.length} kategori, ${jumlahEkstensi} jenis berkas dikenali, ${jumlahTujuan} tujuan konversi`}
        </p>
      </div>

      {total === 0 && (
        <p className="rounded-xl border border-garis px-5 py-6 text-[14px] text-kertas-2/50">
          Tidak ada format yang cocok. Coba kata lain, misalnya bagian dari nama
          berkas seperti <span className="font-mono text-kertas-2/70">svg</span> atau{" "}
          <span className="font-mono text-kertas-2/70">xlsx</span>.
        </p>
      )}

      <div className="border-t border-garis">
        {hasil.map((k, i) => {
          const terbuka = buka === k.id;
          // Saat mencari, buka otomatis supaya hasilnya langsung terlihat.
          const tampilBuka = terbuka || Boolean(kata);
          return (
            <div key={k.id} className="border-b border-garis">
              <button
                type="button"
                onClick={() => setBuka(terbuka ? null : k.id)}
                aria-expanded={tampilBuka}
                className="flex w-full items-baseline gap-4 py-5 pr-2 text-left transition-colors hover:bg-white/[0.02]"
              >
                <span className="w-6 shrink-0 font-mono text-[11.5px] text-kertas-2/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  <span className="block text-[17px] font-semibold tracking-[-0.02em]">
                    {k.judul}
                  </span>
                  <span className="mt-1 block text-[13px] text-kertas-2/45">{k.ringkas}</span>
                </span>
                <span className="hidden shrink-0 font-mono text-[11.5px] text-kertas-2/35 sm:block">
                  {k.masuk.length} / {k.keluar.length}
                </span>
                <span
                  className={cn(
                    "shrink-0 text-kertas-2/30 transition-transform",
                    tampilBuka && "rotate-45",
                  )}
                >
                  <Ikon nama="tutup" ukuran={16} />
                </span>
              </button>

              {tampilBuka && (
                <div className="grid gap-7 pb-8 pl-10 pr-2 md:grid-cols-2 md:pl-16">
                  <div>
                    <p className="text-[14px] leading-relaxed text-kertas-2/60">{k.detail}</p>
                    {k.catatan && (
                      <p className="mt-3 border-l-2 border-tembaga/40 pl-3 text-[12.5px] leading-relaxed text-kertas-2/45">
                        {k.catatan}
                      </p>
                    )}
                    <p className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.1em] text-kertas-2/35">
                      Mesin: <span className="text-kertas-2/65">{k.mesin}</span>
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="label mb-2">Bisa dibaca</p>
                      <p className="font-mono text-[12.5px] leading-relaxed text-kertas-2/55">
                        {k.masuk.join(" · ")}
                      </p>
                    </div>
                    <div>
                      <p className="label mb-2">Bisa dihasilkan</p>
                      <p className="font-mono text-[12.5px] leading-relaxed text-kertas-2/55">
                        {k.keluar.join(" · ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
