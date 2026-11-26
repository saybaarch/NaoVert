import Link from "next/link";
import { angka } from "@/lib/data";
import Ikon from "@/components/ikon";
import Tanda3D from "@/components/tanda-3d";
import AngkaHitung from "@/components/angka-hitung";
import JudulMasuk from "@/components/judul-masuk";

/**
 * Hero beranda.
 *
 * Dua kolom di layar lebar: kalimat di kiri, tanda tiga dimensi di kanan.
 * Tandanya bukan hiasan latar, ia benda utama yang memperkenalkan bentuk logo.
 * Di ponsel tanda turun ke bawah kalimat dan mengecil, karena kalimat tetap
 * yang harus dibaca lebih dulu.
 *
 * Gerak di sini ada tiga, semuanya berfungsi: judul masuk baris demi baris
 * supaya mata mengikuti urutan baca, garis di atas angka tumbuh untuk
 * memisahkan dua kelompok informasi, dan angkanya naik dari nol. Tidak ada
 * gradasi, tidak ada bola cahaya, tidak ada kisi.
 */
export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-14 md:pt-40 md:pb-20">
      <div className="wadah">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-6">
          <div>
            <p className="label">Konverter berkas untuk Windows</p>

            <h1 className="judul-besar mt-5 max-w-3xl">
              <JudulMasuk jeda={60}>Satu aplikasi</JudulMasuk>
              <JudulMasuk jeda={180}>untuk semua berkas</JudulMasuk>
              <JudulMasuk jeda={300} redup>
                yang perlu diubah.
              </JudulMasuk>
            </h1>

            <p className="lead mt-7 max-w-lg">
              Gambar, dokumen, PDF, video, audio, tabel, e-book, arsip, font,
              vektor, gambar teknik, dan subtitle. Semua mesin sudah ikut
              terpasang bersama aplikasinya, jadi tidak ada yang perlu dicari
              sendiri setelah pemasangan.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/unduh" className="tombol">
                <Ikon nama="unduh" ukuran={17} />
                Unduh untuk Windows
              </Link>
              <Link href="/format" className="tombol tombol-garis">
                Cek format yang didukung
              </Link>
            </div>

            {/*
              Angka diambil dari data/format.json, bukan ditulis tangan. Tiga
              saja, karena itu yang menjawab pertanyaan pertama orang:
              seberapa luas cakupannya.
            */}
            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
              {angka.slice(0, 3).map((a) => (
                <div key={a.satuan}>
                  <dt className="sr-only">{a.satuan}</dt>
                  <dd className="font-mono text-[19px] leading-none text-tinta">
                    <AngkaHitung nilai={a.nilai} durasi={900} />
                  </dd>
                  <dd className="mt-1.5 text-[12.5px] text-tinta-3">{a.satuan}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="justify-self-center lg:justify-self-end">
            <div className="hidden sm:block">
              <Tanda3D ukuran={380} />
            </div>
            <div className="sm:hidden">
              <Tanda3D ukuran={230} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
