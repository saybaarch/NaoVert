import Image from "next/image";
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

/**
 * Bagian menu klik kanan.
 *
 * Satu setengah lebar untuk gambar, karena tangkapan layar panel pengaturan
 * butuh ruang supaya sakelarnya masih terbaca. Teksnya di kiri agar mata
 * berhenti dulu pada penjelasan sebelum melihat gambar.
 */
export default function BagianKlikKanan() {
  return (
    <section className="pemisah">
      <div className="wadah py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="label">Di File Explorer</p>
            <h2 className="judul-bagian mt-4">
              Klik kanan berkas,
              <br />
              <span className="text-kertas-2/45">pilih format, selesai.</span>
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
                  <p className="text-[14px] leading-relaxed text-kertas-2/55">
                    <b className="font-semibold text-kertas/85">{b.tebal}</b> {b.isi}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <Muncul className="overflow-hidden rounded-2xl border border-garis bg-ink-2">
            <div className="flex items-center gap-2 border-b border-garis px-4 py-2.5">
              <span className="flex gap-1.5" aria-hidden="true">
                <i className="size-2 rounded-full bg-white/12" />
                <i className="size-2 rounded-full bg-white/12" />
                <i className="size-2 rounded-full bg-white/12" />
              </span>
              <span className="ml-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-kertas-2/30">
                Pengaturan integrasi Windows
              </span>
            </div>
            <Image
              src={tangkapan.integrasi}
              alt="Panel Pengaturan NaoVert yang menampilkan sakelar untuk menu klik kanan, ikon baki, dan hidup otomatis saat Windows dinyalakan."
              width={1583}
              height={923}
              sizes="(max-width: 1024px) 100vw, 640px"
              className="h-auto w-full"
            />
          </Muncul>
        </div>
      </div>
    </section>
  );
}
