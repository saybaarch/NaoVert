import Image from "next/image";
import { tangkapan } from "@/lib/data";
import KepalaBagian from "@/components/kepala-bagian";
import Muncul from "@/components/muncul";

const gambar = [
  {
    src: tangkapan.gabung,
    alt: "Dialog gabung dokumen berisi beberapa berkas dengan pilihan keluaran PDF dan Word serta tombol untuk mengatur urutan.",
    judul: "Gabung ke PDF atau Word",
    ket: "Dua keluaran dari daftar berkas yang sama, urutannya bisa diatur per baris.",
    lebar: 1583,
    tinggi: 923,
  },
  {
    src: tangkapan.jendela,
    alt: "Jendela utama NaoVert dengan daftar berkas di kiri dan pilihan format tujuan di tengah.",
    judul: "Jendela utama",
    ket: "Daftar berkas dan pilihan format, tanpa panel yang menutupi isi.",
    lebar: 1280,
    tinggi: 802,
  },
  {
    src: tangkapan.penjelasan,
    alt: "Panel penjelasan format vektor dalam keadaan terbuka, berisi keterangan rinci.",
    judul: "Penjelasan format",
    ket: "Bisa dibuka dan ditutup, jadi layar tetap lapang saat tidak diperlukan.",
    lebar: 1583,
    tinggi: 923,
  },
];

/**
 * Galeri tampilan.
 *
 * Tiga tangkapan layar dari aplikasi terpasang. Bingkainya diberi bilah tipis
 * di atas supaya terbaca sebagai jendela aplikasi, bukan sebagai gambar lepas.
 */
export default function BagianGaleri() {
  return (
    <section className="pemisah">
      <div className="wadah py-20 md:py-28">
        <KepalaBagian
          label="Tampilan"
          judul={
            <>
              Seperti apa
              <br />
              <span className="text-kertas-2/45">aplikasinya.</span>
            </>
          }
          penjelas="Tangkapan layar di bawah diambil dari aplikasi versi terpasang, bukan gambar rancangan."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {gambar.map((g, i) => (
            <Muncul
              key={g.judul}
              jeda={i * 70}
              className={i === 0 ? "md:col-span-2" : undefined}
            >
              <figure>
                <div className="overflow-hidden rounded-xl border border-garis bg-ink-2">
                  <div className="flex items-center gap-2 border-b border-garis px-3.5 py-2">
                    <span className="flex gap-1.5" aria-hidden="true">
                      <i className="size-1.5 rounded-full bg-white/12" />
                      <i className="size-1.5 rounded-full bg-white/12" />
                      <i className="size-1.5 rounded-full bg-white/12" />
                    </span>
                  </div>
                  <Image
                    src={g.src}
                    alt={g.alt}
                    width={g.lebar}
                    height={g.tinggi}
                    sizes={i === 0 ? "(max-width: 768px) 100vw, 1100px" : "(max-width: 768px) 100vw, 550px"}
                    className="h-auto w-full"
                  />
                </div>
                <figcaption className="mt-3 text-[12.5px] text-kertas-2/40">
                  <b className="font-medium text-kertas-2/70">{g.judul}</b>, {g.ket}
                </figcaption>
              </figure>
            </Muncul>
          ))}
        </div>
      </div>
    </section>
  );
}
