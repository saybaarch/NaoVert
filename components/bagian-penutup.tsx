import Link from "next/link";
import { penutup, situs } from "@/lib/data";
import Muncul from "@/components/muncul";
import Ikon from "@/components/ikon";

/**
 * Penutup beranda.
 *
 * Mengikuti penutup acuan: satu kartu putih besar di tengah, ikon unduh kecil,
 * judul pendek, satu paragraf, lalu dua tombol. Tidak ada blok gelap; seluruh
 * halaman memakai satu kanvas.
 */
export default function BagianPenutup() {
  return (
    <section id="unduh" className="scroll-mt-24 pb-20 md:pb-28">
      <div className="wadah">
        <Muncul className="mx-auto max-w-4xl rounded-3xl border border-garis bg-panel px-6 py-14 text-center shadow-[var(--bayang-kartu)] md:px-16 md:py-18">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-garis bg-timbul text-tembaga">
            <Ikon nama="unduh" ukuran={24} />
          </span>
          <h2 className="judul-bagian mx-auto mt-6 max-w-xl">{penutup.judul.join(" ")}</h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-tinta-2">
            {penutup.isi}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/unduh" className="tombol">
              <Ikon nama="unduh" ukuran={17} />
              Unduh NaoVert
            </Link>
            <Link href="/panduan" className="tombol tombol-garis">
              Baca panduan
            </Link>
          </div>

          <div className="mx-auto mt-9 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-garis pt-6 font-mono text-[11px] text-tinta-3">
            <span>{situs.sistem}</span>
            <span>Paket mulai Rp15.000</span>
            <span>Lisensi Sayba Arc Desktop Edition</span>
          </div>
        </Muncul>
      </div>
    </section>
  );
}
