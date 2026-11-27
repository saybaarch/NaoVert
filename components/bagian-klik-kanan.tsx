import Image from "next/image";
import Link from "next/link";
import { tangkapan } from "@/lib/data";
import KepalaBagian from "@/components/kepala-bagian";
import Muncul from "@/components/muncul";
import Ikon from "@/components/ikon";

const butir = [
  {
    tebal: "Hanya format yang cocok.",
    isi: "Berkas gambar menampilkan tujuan gambar, berkas dokumen menampilkan tujuan dokumen. Tidak ada daftar panjang yang membingungkan.",
  },
  {
    tebal: "Tanpa membuka dashboard.",
    isi: "Konversi berjalan di latar belakang, hasilnya muncul di folder yang sama dengan berkas aslinya.",
  },
  {
    tebal: "Bisa dimatikan.",
    isi: "Menu klik kanan, ikon baki, dan hidup otomatis semuanya mati secara bawaan. Anda yang memutuskan kapan menyalakannya.",
  },
];

export default function BagianKlikKanan() {
  return (
    <section id="klik-kanan" className="pemisah scroll-mt-24">
      <div className="wadah py-20 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="label">Di File Explorer</p>
            <h2 className="judul-bagian mt-3">
              Klik kanan berkas,
              <br />
              <span className="text-tinta-3">pilih format, selesai.</span>
            </h2>
            <p className="lead mt-5">
              Setelah fitur ini dinyalakan di Pengaturan, menu klik kanan Windows
              menampilkan entri Konversi dengan NaoVert beserta submenu berisi format
              yang cocok untuk berkas itu. Hasilnya langsung masuk ke folder yang sama.
            </p>

            <ul className="mt-8 flex flex-col gap-4">
              {butir.map((b) => (
                <li key={b.tebal} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 text-tembaga">
                    <Ikon nama="centang" ukuran={17} />
                  </span>
                  <p className="text-[13.5px] leading-relaxed text-tinta-2">
                    <b className="font-semibold text-tinta">{b.tebal}</b> {b.isi}
                  </p>
                </li>
              ))}
            </ul>

            <Link href="/panduan" className="tombol tombol-garis mt-8">
              Lihat panduan
              <Ikon nama="panah" ukuran={16} />
            </Link>
          </div>

          <Muncul className="overflow-hidden rounded-2xl border border-garis bg-panel shadow-[var(--bayang-timbul)]">
            <div className="flex items-center gap-2 border-b border-garis bg-timbul/60 px-4 py-2.5">
              <span className="flex gap-1.5" aria-hidden="true">
                <i className="size-2 rounded-full bg-tinta-3/30" />
                <i className="size-2 rounded-full bg-tinta-3/30" />
                <i className="size-2 rounded-full bg-tinta-3/30" />
              </span>
              <span className="ml-2 text-[11px] font-semibold text-tinta-2">
                Pengaturan integrasi Windows
              </span>
            </div>
            <Image
              src={tangkapan.pengaturan}
              alt="Panel Pengaturan NaoVert yang menampilkan sakelar untuk menu klik kanan, ikon baki, dan hidup otomatis saat Windows dinyalakan."
              width={2480}
              height={1560}
              sizes="(max-width: 1024px) 100vw, 640px"
              className="h-auto w-full"
            />
          </Muncul>
        </div>
      </div>
    </section>
  );
}
