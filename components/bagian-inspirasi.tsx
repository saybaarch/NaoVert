import Image from "next/image";
import Link from "next/link";
import { tangkapan } from "@/lib/data";
import Ikon from "@/components/ikon";
import Muncul from "@/components/muncul";

/**
 * Galeri inspirasi.
 *
 * Mengikuti acuan: tiga kartu gambar persegi yang bisa digeser mendatar di
 * layar sempit, dengan judul dan satu kalimat di bawah gambarnya. Gambarnya
 * tangkapan aplikasi sendiri, bukan foto stok.
 */

const cerita = [
  {
    gambar: tangkapan.pengaturan,
    alt: "Panel pengaturan NaoVert berisi status mesin konversi.",
    judul: "Mahasiswa merapikan tugas akhir",
    isi: "Dokumen Word, tabel Excel, dan gambar lapangan diubah ke PDF dalam satu kali seret, tanpa membuka tiga aplikasi.",
  },
  {
    gambar: tangkapan.gabung,
    alt: "Dialog gabung dokumen NaoVert.",
    judul: "Kantor kecil menggabung laporan",
    isi: "Belasan PDF bulanan digabung berurutan, diberi nama baru, lalu dikirim ke pimpinan dalam hitungan detik.",
  },
  {
    gambar: tangkapan.terang,
    alt: "Jendela NaoVert dalam tema terang.",
    judul: "Fotografer menyerahkan hasil",
    isi: "RAW dan HEIC dari kamera diubah ke JPG dengan nama yang sama, siap masuk folder klien.",
  },
];

export default function BagianInspirasi() {
  return (
    <section className="pemisah">
      <div className="wadah py-20 md:py-28">
        <Muncul className="mx-auto max-w-2xl text-center">
          <h2 className="judul-bagian">Dapatkan inspirasi</h2>
          <p className="lead mx-auto mt-5">
            Lihat bagaimana pekerjaan harian selesai lebih cepat dengan satu
            aplikasi konversi lokal.
          </p>
        </Muncul>

        <div className="geser-kejutan -mx-6 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:gap-6">
          {cerita.map((c, i) => (
            <Muncul key={c.judul} as="article" jeda={i * 60} className="w-[78%] shrink-0 snap-start md:w-auto">
              <div className="group overflow-hidden rounded-2xl border border-garis bg-timbul">
                <Image
                  src={c.gambar}
                  alt={c.alt}
                  width={2480}
                  height={1560}
                  sizes="(max-width: 768px) 78vw, 26rem"
                  className="aspect-square w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.025]"
                />
              </div>
              <h3 className="mt-4 flex items-start gap-1.5 text-[15px] font-medium leading-snug tracking-[-0.015em]">
                {c.judul}
                <Ikon nama="panah" ukuran={14} className="mt-0.5 shrink-0 text-tinta-3" />
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-tinta-2">{c.isi}</p>
            </Muncul>
          ))}
        </div>

        <Muncul className="mt-12 flex justify-center">
          <Link href="/panduan" className="tombol tombol-garis">
            Baca panduan lengkap
            <Ikon nama="panah" ukuran={16} />
          </Link>
        </Muncul>
      </div>
    </section>
  );
}
