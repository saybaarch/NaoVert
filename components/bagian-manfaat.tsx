import Image from "next/image";
import Link from "next/link";
import { tangkapan } from "@/lib/data";
import Ikon from "@/components/ikon";
import Muncul from "@/components/muncul";

/**
 * Manfaat harian.
 *
 * Mengikuti acuan: judul di tengah, lalu deretan kartu lebar tetap yang bisa
 * digeser mendatar dengan snap. Tiap kartu berisi judul, paragraf, dan
 * tangkapan aplikasi di kakinya. Di layar lebar kartu mengalir sebagai kolom.
 */

const kartu = [
  {
    judul: "Menulis dan merapikan",
    isi: "Ubah catatan kasar menjadi dokumen rapi. Word, teks, dan HTML bisa langsung menjadi PDF tanpa memasang paket perkantoran.",
    gambar: tangkapan.berkas,
    alt: "Daftar berkas dokumen di jendela NaoVert.",
  },
  {
    judul: "Gambar tanpa aplikasi lain",
    isi: "HEIC dari ponsel, PSD dari desainer, dan RAW dari kamera bisa disimpan menjadi JPG atau PNG yang bisa dibuka siapa saja.",
    gambar: tangkapan.format,
    alt: "Pilihan format tujuan untuk berkas gambar.",
  },
  {
    judul: "Video dan audio",
    isi: "Potong kebutuhan format video dan audio sehari-hari. MP4, MKV, MOV, MP3, dan WAV dikerjakan mesin yang sama di dalam aplikasi.",
    gambar: tangkapan.proses,
    alt: "Antrean konversi video dan audio.",
  },
  {
    judul: "Tabel dan data",
    isi: "CSV, XLSX, dan ODS saling bertukar tanpa Excel. Angka tetap angka, judul kolom tetap di tempatnya.",
    gambar: tangkapan.selesai,
    alt: "Ringkasan hasil konversi tabel.",
  },
  {
    judul: "Gambar teknik dan vektor",
    isi: "DWG, DXF, SVG, dan PDF saling terbaca. Berkas CAD tidak perlu dikirim ke layanan luar hanya untuk dilihat.",
    gambar: tangkapan.terang,
    alt: "Jendela NaoVert dalam tema terang.",
  },
];

export default function BagianManfaat() {
  return (
    <section className="pemisah">
      <div className="wadah py-20 md:py-28">
        <Muncul className="mx-auto max-w-3xl text-center">
          <h2 className="judul-bagian">
            Dipakai untuk pekerjaan,
            <br />
            <span className="text-tinta-3">studi, dan berkas harian.</span>
          </h2>
          <p className="lead mx-auto mt-5">
            Semua kemampuan di bawah tersedia di kedua paket lisensi. Tidak ada
            fitur yang dikunci di balik paket tertentu.
          </p>
        </Muncul>

        <div className="geser-kejutan -mx-6 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">
          {kartu.map((k, i) => (
            <Muncul
              key={k.judul}
              jeda={Math.min(i * 50, 200)}
              className="kartu flex w-[298px] shrink-0 snap-start flex-col overflow-hidden md:w-auto md:min-h-[22rem]"
            >
              <div className="p-6">
                <h3 className="text-[1.05rem] font-semibold tracking-[-0.02em]">{k.judul}</h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-tinta-2">{k.isi}</p>
              </div>
              <div className="mt-auto">
                <Image
                  src={k.gambar}
                  alt={k.alt}
                  width={2480}
                  height={1560}
                  sizes="(max-width: 768px) 298px, 24rem"
                  className="h-auto w-full object-cover"
                />
              </div>
            </Muncul>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/tentang" className="tombol tombol-garis">
            Kenapa dibuat begini
            <Ikon nama="panah" ukuran={16} />
          </Link>
          <span className="text-[12.5px] text-tinta-3">
            Setiap klaim di atas bisa Anda periksa sendiri di aplikasinya.
          </span>
        </div>
      </div>
    </section>
  );
}
