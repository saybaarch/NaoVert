import Link from "next/link";
import { penutup, situs } from "@/lib/data";
import Muncul from "@/components/muncul";
import Ikon from "@/components/ikon";

/**
 * Penutup.
 *
 * Satu ajakan saja, karena di titik ini orang sudah membaca semuanya. Tidak
 * ada kotak berbingkai, tidak ada daftar pengingat. Hanya judul besar dan dua
 * tombol, dengan ruang kosong yang lebar di sekelilingnya.
 */
export default function BagianPenutup() {
  return (
    <section className="pemisah">
      <div className="wadah py-24 md:py-36">
        <Muncul className="mx-auto max-w-3xl text-center">
          <p className="label">{penutup.label}</p>
          <h2 className="judul-besar mt-6">
            {penutup.judul.map((baris, i) => (
              <span key={baris} className={i === 0 ? "block" : "block text-tinta-3"}>
                {baris}
              </span>
            ))}
          </h2>
          <p className="lead mx-auto mt-7 max-w-md">{penutup.isi}</p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/unduh" className="tombol">
              <Ikon nama="unduh" ukuran={18} />
              Unduh {situs.nama} {situs.versi}
            </Link>
            <Link href="/panduan" className="tombol tombol-garis">
              Baca panduan
              <Ikon nama="panah" ukuran={17} />
            </Link>
          </div>

          <p className="mt-8 text-[12.5px] text-tinta-3">
            {situs.sistem}. Gratis, tanpa akun, tanpa batas jumlah berkas.
          </p>
        </Muncul>
      </div>
    </section>
  );
}
