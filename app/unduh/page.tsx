import type { Metadata } from "next";
import Link from "next/link";
import KepalaHalaman from "@/components/kepala-halaman";
import Muncul from "@/components/muncul";
import Ikon from "@/components/ikon";
import { situs } from "@/lib/data";

export const metadata: Metadata = {
  title: "Unduh",
  description: `Unduh NaoVert ${situs.versi} untuk Windows 10 dan 11, 64 bit. Pilih paket lisensi bulanan atau tahunan.`,
};

const isi = [
  {
    judul: "Satu pemasang",
    isi: "Berkas pemasang tunggal berisi aplikasi dan seluruh mesin konversi. Tidak ada unduhan terpisah setelahnya.",
  },
  {
    judul: "Tanpa izin administrator",
    isi: "Pemasangan berjalan untuk pengguna Anda sendiri, jadi tidak perlu izin administrator dan tidak mengubah sistem secara menyeluruh.",
  },
  {
    judul: "Bisa dicopot bersih",
    isi: "Mencopot pemasangan menghapus aplikasi beserta mesin dan entri menunya. Tidak ada sisa yang tertinggal di sistem.",
  },
];

const langkahPasang = [
  "Unduh berkas pemasang, lalu jalankan.",
  "Ikuti langkahnya sampai selesai. Tidak ada pilihan mesin yang perlu dicentang.",
  "Buka NaoVert dari menu Mulai, lalu seret berkas ke jendelanya.",
];

export default function HalamanUnduh() {
  return (
    <>
      <KepalaHalaman
        label="Unduh"
        judul={
          <>
            Pasang sekali,
            <br />
            <span className="text-tinta-3">langsung bekerja.</span>
          </>
        }
        penjelas={`NaoVert ${situs.versi} untuk ${situs.sistem}. Tersedia dalam paket bulanan dan tahunan, dengan konversi lokal tanpa batas jumlah berkas.`}
      >
        <div className="flex flex-wrap gap-3">
          {/* Berkas pemasang belum dipublikasikan, jadi tombolnya sengaja
              tidak menautkan ke alamat yang belum ada. Tautan yang berakhir
              di halaman kosong lebih buruk daripada tombol yang jujur. */}
          <button type="button" className="tombol" disabled>
            <Ikon nama="unduh" ukuran={18} />
            Unduh pemasang
          </button>
          <Link href="/harga" className="tombol tombol-garis">
            Lihat paket lisensi
            <Ikon nama="panah" ukuran={17} />
          </Link>
        </div>
      </KepalaHalaman>

      <div className="wadah pb-24">
        <p className="mb-10 rounded-2xl border border-tembaga/30 bg-sorot px-5 py-4 text-[13px] leading-relaxed text-tinta-2">
          <b className="text-tinta">Berkas pemasang belum tersedia.</b> Situs ini
          sedang disusun ulang. Tombol unduh akan aktif setelah berkas rilis
          pertama dan alur aktivasi paket dipublikasikan.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {isi.map((b, i) => (
            <Muncul key={b.judul} jeda={i * 60} className="kartu p-7 md:p-8">
              <h2 className="text-[16px] font-semibold tracking-[-0.015em]">{b.judul}</h2>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-tinta-2">{b.isi}</p>
            </Muncul>
          ))}
        </div>

        <Muncul className="mt-14">
          <p className="label">Langkah pemasangan</p>
          <ol className="mt-5 border-t border-garis">
            {langkahPasang.map((l, i) => (
              <li key={l} className="flex gap-5 border-b border-garis py-5">
                <span className="w-6 shrink-0 font-mono text-[11.5px] text-tembaga">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[14.5px] leading-relaxed text-tinta-2">{l}</p>
              </li>
            ))}
          </ol>
        </Muncul>
      </div>
    </>
  );
}
