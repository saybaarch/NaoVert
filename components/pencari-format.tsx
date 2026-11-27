"use client";

import { useMemo, useState } from "react";
import { keluarga, jumlahEkstensi, jumlahTujuan } from "@/lib/data";
import Ikon from "@/components/ikon";
import { cn } from "@/lib/utils";

type Keluarga = (typeof keluarga)[number];

/*
 * Daftar format.
 *
 * Susunannya sengaja tidak rata. Tiga kategori dengan jangkauan terluas
 * mendapat ruang paling besar, dan di antara ketiganya pun tidak sama: yang
 * paling luas memakai satu baris penuh mendatar, dua berikutnya berdampingan.
 * Sepuluh sisanya masuk ke indeks dua kolom yang lebih rapat. Alasannya isi:
 * orang paling sering datang membawa gambar, dokumen, atau media, jadi ketiga
 * itu harus terbaca tanpa membuka apa pun, sedangkan kategori yang lebih
 * khusus cukup terbaca sebagai baris.
 *
 * Ukuran kartu mengikuti jumlah format masuk yang sungguhan dari data, bukan
 * angka karangan. Garis tipis di dalam kartu juga begitu: panjangnya adalah
 * bagian dari jumlah terbanyak, jadi terbaca sebagai perbandingan.
 *
 * Saat mencari, semua kategori kembali ke satu bentuk yang sama, yaitu baris
 * rapat. Waktu itu yang dibutuhkan kecepatan membandingkan, bukan variasi.
 */

const TERBANYAK = Math.max(...keluarga.map((k) => k.masuk.length));

function Chip({ teks }: { teks: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-garis px-1.5 py-[3px] font-mono text-[10.5px] uppercase tracking-[0.04em] text-tinta-2">
      {teks}
    </span>
  );
}

function Angka({ masuk, keluar }: { masuk: number; keluar: number }) {
  return (
    <p className="flex items-baseline gap-1.5 font-mono text-[11px] text-tinta-3">
      <span className="text-tinta-2">{masuk}</span>
      <span>masuk</span>
      <span aria-hidden="true">/</span>
      <span className="text-tinta-2">{keluar}</span>
      <span>keluar</span>
    </p>
  );
}

/** Garis perbandingan jangkauan. Panjangnya bagian dari kategori terluas. */
function Jangkauan({ nilai }: { nilai: number }) {
  const persen = Math.round((nilai / TERBANYAK) * 100);
  return (
    <div
      className="h-px w-full bg-garis"
      role="img"
      aria-label={`${nilai} format masuk, ${persen} persen dari kategori terluas`}
    >
      <div className="h-px bg-tembaga/70" style={{ width: `${persen}%` }} />
    </div>
  );
}

function DaftarEkstensi({
  judul,
  isi,
  batas = 24,
}: {
  judul: string;
  isi: string[];
  batas?: number;
}) {
  return (
    <div>
      <p className="label mb-2">{judul}</p>
      <p className="flex flex-wrap gap-1.5">
        {isi.slice(0, batas).map((e) => (
          <Chip key={e} teks={e} />
        ))}
        {isi.length > batas && (
          <span className="self-center font-mono text-[10.5px] text-tinta-3">
            +{isi.length - batas} lagi
          </span>
        )}
      </p>
    </div>
  );
}

/** Kartu lebar: satu kategori memakai satu baris penuh, isinya menyebar. */
function KartuLebar({ k }: { k: Keluarga }) {
  const [buka, setBuka] = useState(false);
  return (
    <article className="panel relative overflow-hidden rounded-md p-5 md:p-7">
      <div className="grid gap-6 md:grid-cols-[1.15fr_1fr] md:gap-10">
        <div>
          <p className="mb-3 flex items-center gap-2 text-tinta-3">
            <Ikon nama="dokumen" ukuran={15} />
            <span className="label !text-tinta-3">Paling luas</span>
          </p>
          <h3 className="text-[26px] font-semibold leading-[1.05] tracking-[-0.035em] md:text-[32px]">
            {k.judul}
          </h3>
          <p className="mt-3 max-w-[46ch] text-[14px] leading-[1.7] text-tinta-2">{k.ringkas}</p>
          <div className="mt-5 max-w-[280px]">
            <Angka masuk={k.masuk.length} keluar={k.keluar.length} />
            <div className="mt-2">
              <Jangkauan nilai={k.masuk.length} />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <DaftarEkstensi judul="Bisa dihasilkan" isi={k.keluar} batas={12} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-garis pt-4">
            <p className="font-mono text-[11px] text-tinta-3">
              Mesin <span className="text-tinta-2">{k.mesin}</span>
            </p>
            <button
              type="button"
              onClick={() => setBuka((v) => !v)}
              aria-expanded={buka}
              /* Tinggi 19 px terlalu kecil untuk jari. min-h-11 memberi sasaran
                 sentuh 44 px tanpa mengubah jarak baris, karena margin
                 negatifnya menarik kembali ruang yang dipakai padding. */
              className="-my-3 inline-flex min-h-11 items-center gap-1.5 py-3 text-[12.5px] text-tinta-2 transition-colors hover:text-tinta"
            >
              {buka ? "Tutup rincian" : "Rincian kategori"}
              <span className={cn("transition-transform", buka && "rotate-45")}>
                <Ikon nama="tutup" ukuran={13} />
              </span>
            </button>
          </div>
          {buka && (
            <div className="space-y-4 border-t border-garis pt-4">
              <p className="text-[13.5px] leading-[1.7] text-tinta-2">{k.detail}</p>
              {k.catatan && (
                <p className="border-l-2 border-tembaga/40 pl-3 text-[12.5px] leading-[1.65] text-tinta-3">
                  {k.catatan}
                </p>
              )}
              <DaftarEkstensi judul="Bisa dibaca" isi={k.masuk} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/** Kartu sedang: dua kategori berdampingan, susunannya menumpuk ke bawah. */
function KartuSedang({ k }: { k: Keluarga }) {
  const [buka, setBuka] = useState(false);
  return (
    <article className="panel flex h-full w-full flex-col rounded-md p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[21px] font-semibold leading-tight tracking-[-0.03em]">{k.judul}</h3>
        <span className="shrink-0 font-mono text-[11px] text-tinta-3">{k.mesin}</span>
      </div>
      <p className="mt-2 text-[13.5px] leading-[1.65] text-tinta-2">{k.ringkas}</p>

      <div className="mt-4">
        <Angka masuk={k.masuk.length} keluar={k.keluar.length} />
        <div className="mt-2">
          <Jangkauan nilai={k.masuk.length} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {k.keluar.slice(0, 6).map((e) => (
          <Chip key={e} teks={e} />
        ))}
        {k.keluar.length > 6 && (
          <span className="self-center font-mono text-[10.5px] text-tinta-3">
            +{k.keluar.length - 6}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-expanded={buka}
        className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-5 text-[12.5px] text-tinta-2 transition-colors hover:text-tinta"
      >
        {buka ? "Tutup rincian" : "Rincian kategori"}
        <span className={cn("transition-transform", buka && "rotate-45")}>
          <Ikon nama="tutup" ukuran={13} />
        </span>
      </button>

      {buka && (
        <div className="mt-4 space-y-4 border-t border-garis pt-4">
          <p className="text-[13px] leading-[1.7] text-tinta-2">{k.detail}</p>
          <DaftarEkstensi judul="Bisa dibaca" isi={k.masuk} batas={20} />
          <DaftarEkstensi judul="Bisa dihasilkan" isi={k.keluar} batas={20} />
        </div>
      )}
    </article>
  );
}

/** Baris indeks: rapat, bisa dibuka, dipakai untuk kategori yang lebih khusus. */
function BarisIndeks({ k, nomor }: { k: Keluarga; nomor: number }) {
  return (
    <details className="group border-b border-garis">
      <summary className="flex cursor-pointer list-none items-center gap-3 py-3.5 transition-colors hover:text-tinta md:gap-4">
        <span className="w-5 shrink-0 font-mono text-[10.5px] text-tinta-3">
          {String(nomor).padStart(2, "0")}
        </span>
        <span className="flex-1 text-[15px] font-medium tracking-[-0.018em] text-tinta-2 group-hover:text-tinta">
          {k.judul}
        </span>
        <span className="hidden shrink-0 font-mono text-[10.5px] text-tinta-3 sm:inline">
          {k.masuk.length}/{k.keluar.length}
        </span>
        <span className="shrink-0 text-tinta-3 transition-transform group-open:rotate-45">
          <Ikon nama="tutup" ukuran={14} />
        </span>
      </summary>
      <div className="space-y-3.5 pb-5 pl-8 pr-1">
        <p className="text-[13px] leading-[1.7] text-tinta-2">{k.ringkas}</p>
        {k.catatan && (
          <p className="border-l-2 border-tembaga/40 pl-3 text-[12px] leading-[1.6] text-tinta-3">
            {k.catatan}
          </p>
        )}
        <DaftarEkstensi judul="Bisa dibaca" isi={k.masuk} batas={18} />
        <DaftarEkstensi judul="Bisa dihasilkan" isi={k.keluar} batas={18} />
        <p className="font-mono text-[10.5px] text-tinta-3">
          Mesin <span className="text-tinta-2">{k.mesin}</span>
        </p>
      </div>
    </details>
  );
}

export default function PencariFormat() {
  const [kata, setKata] = useState("");

  const hasil = useMemo(() => {
    const q = kata.trim().toLowerCase();
    if (!q) return null;
    return keluarga
      .map((k) => ({
        ...k,
        cocokMasuk: k.masuk.filter((e) => e.toLowerCase().includes(q)),
        cocokKeluar: k.keluar.filter((e) => e.toLowerCase().includes(q)),
        cocokJudul: k.judul.toLowerCase().includes(q),
      }))
      .filter((k) => k.cocokJudul || k.cocokMasuk.length > 0 || k.cocokKeluar.length > 0);
  }, [kata]);

  // Tanpa pencarian, tiga kategori terluas dipisah dari sisanya.
  const urut = useMemo(
    () => [...keluarga].sort((a, b) => b.masuk.length - a.masuk.length),
    [],
  );
  const utama = urut.slice(0, 3);
  const sisa = urut.slice(3);

  return (
    <div>
      <div className="sticky top-[76px] z-20 -mx-1 mb-9 bg-latar/88 px-1 py-3 backdrop-blur-xl">
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tinta-3">
            <Ikon nama="panah" ukuran={16} />
          </span>
          <input
            type="search"
            value={kata}
            onChange={(e) => setKata(e.target.value)}
            placeholder="Ketik nama format, misalnya pdf, heic, atau docx"
            aria-label="Cari format"
            className="h-12 w-full rounded-md border border-garis-2 bg-panel pl-11 pr-4 text-[14.5px] text-tinta placeholder:text-tinta-3 focus:border-tinta-3 focus:outline-none"
          />
        </div>
        <p className="mt-2.5 pl-1 text-[12px] text-tinta-3" aria-live="polite">
          {hasil
            ? `${hasil.length} kategori cocok dengan "${kata.trim()}"`
            : `${keluarga.length} kategori, ${jumlahEkstensi} jenis berkas dikenali, ${jumlahTujuan} tujuan konversi`}
        </p>
      </div>

      {hasil && hasil.length === 0 && (
        <p className="rounded-md border border-garis px-5 py-6 text-[14px] text-tinta-3">
          Tidak ada format yang cocok. Coba kata lain, misalnya bagian dari nama berkas
          seperti <span className="font-mono text-tinta-2">svg</span> atau{" "}
          <span className="font-mono text-tinta-2">xlsx</span>.
        </p>
      )}

      {/* Hasil pencarian: satu bentuk seragam supaya cepat dibandingkan. */}
      {hasil && hasil.length > 0 && (
        <div className="border-t border-garis">
          {hasil.map((k, i) => (
            <BarisIndeks key={k.id} k={k} nomor={i + 1} />
          ))}
        </div>
      )}

      {/* Tanpa pencarian: komposisi bertingkat. */}
      {!hasil && (
        <>
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-12">
              <KartuLebar k={utama[0]} />
            </div>
            {utama.slice(1).map((k) => (
              <div key={k.id} className="md:col-span-6 md:flex">
                <KartuSedang k={k} />
              </div>
            ))}
          </div>

          <div className="mt-12">
            <div className="mb-1 flex items-baseline justify-between gap-4 border-b border-garis-2 pb-2">
              <h2 className="label !text-tinta-2">Sepuluh kategori lain</h2>
              <p className="font-mono text-[10.5px] text-tinta-3">masuk / keluar</p>
            </div>
            <div className="grid gap-x-10 md:grid-cols-2">
              {sisa.map((k, i) => (
                <BarisIndeks key={k.id} k={k} nomor={i + 4} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}