import Link from "next/link";
import { Tanda } from "@/components/ikon";

export default function TidakDitemukan() {
  return (
    <section className="grid min-h-[70vh] place-items-center px-6 py-32">
      <div className="max-w-md text-center">
        <span className="inline-flex text-kertas-2/35">
          <Tanda ukuran={40} />
        </span>
        <h1 className="judul-bagian mt-8">
          Halaman ini
          <br />
          <span className="text-kertas-2/45">tidak ada.</span>
        </h1>
        <p className="lead mx-auto mt-5">
          Alamatnya mungkin salah ketik, atau halamannya sudah dipindahkan.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="tombol">
            Kembali ke beranda
          </Link>
          <Link href="/format" className="tombol tombol-garis">
            Lihat daftar format
          </Link>
        </div>
      </div>
    </section>
  );
}
