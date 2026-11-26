import Link from "next/link";
import { situs } from "@/lib/data";
import Ikon from "@/components/ikon";

/**
 * Hero beranda.
 *
 * Mengikuti pola acuan: judul dipecah beberapa baris, dan tiap baris meredup
 * ke bawah. Efeknya mata turun sendiri dan berhenti di tombol. Tidak ada
 * gambar latar, tidak ada gradasi. Yang mengisi layar hanya huruf dan ruang.
 */
export default function Hero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-44 md:pb-24">
      <div className="wadah">
        <p className="label">Konverter berkas untuk Windows</p>

        <h1 className="judul-besar mt-5 max-w-5xl">
          <span className="block">Berkas apa pun</span>
          <span className="block text-kertas-2">jadi format lain,</span>
          <span className="block text-kertas/35">tanpa unggah.</span>
        </h1>

        <p className="lead mt-8 max-w-lg">
          {situs.nama} mengubah gambar, dokumen, PDF, video, audio, tabel, e-book,
          arsip, font, vektor, gambar teknik, dan subtitle. Semua mesin konversi
          sudah ikut terpasang. Gratis.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/unduh" className="tombol">
            <Ikon nama="unduh" ukuran={18} />
            Unduh untuk Windows
          </Link>
          <Link href="/format" className="tombol tombol-garis">
            Lihat daftar format
            <Ikon nama="panah" ukuran={17} />
          </Link>
        </div>

        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11.5px] uppercase tracking-[0.1em] text-kertas-2/35">
          <li>Tidak perlu akun</li>
          <li aria-hidden="true">·</li>
          <li>Hasil di folder yang sama</li>
          <li aria-hidden="true">·</li>
          <li>Gratis</li>
        </ul>
      </div>
    </section>
  );
}
