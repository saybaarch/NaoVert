import type { Metadata } from "next";
import Link from "next/link";
import KepalaHalaman from "@/components/kepala-halaman";
import PitaFormat from "@/components/pita-format";
import BagianVideo from "@/components/bagian-video";
import BagianCara from "@/components/bagian-cara";
import BagianKlikKanan from "@/components/bagian-klik-kanan";
import BagianGaleri from "@/components/bagian-galeri";
import Ikon from "@/components/ikon";
import { situs } from "@/lib/data";

export const metadata: Metadata = {
  title: "Fitur",
  description:
    "Seluruh fitur NaoVert: kategori berkas, mesin konversi lokal, menu klik kanan Explorer, dan tampilan aplikasi.",
};

export default function HalamanFitur() {
  return (
    <>
      <KepalaHalaman
        label="Fitur"
        judul={
          <>
            Semua yang ada
            <br />
            <span className="text-tinta-3">di dalam aplikasi.</span>
          </>
        }
        penjelas={`${situs.nama} membawa seluruh mesin konversi sejak pemasangan. Halaman ini menjelaskan apa yang bisa dikerjakan, bagaimana caranya, dan seperti apa tampilannya.`}
      >
        <Link href="/format" className="tombol">
          Cari format
          <Ikon nama="panah" ukuran={16} />
        </Link>
        <Link href="/unduh" className="tombol tombol-garis">
          <Ikon nama="unduh" ukuran={17} />
          Unduh aplikasi
        </Link>
      </KepalaHalaman>

      <PitaFormat />
      <BagianVideo />
      <BagianCara />
      <BagianKlikKanan />
      <BagianGaleri />
    </>
  );
}
