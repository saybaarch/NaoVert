import Link from "next/link";
import { kemampuan, situs } from "@/lib/data";
import Ikon from "@/components/ikon";
import Muncul from "@/components/muncul";

/**
 * Keamanan berkas.
 *
 * Mengikuti acuan: judul dan paragraf di tengah, lalu dua kartu bergaris yang
 * masing-masing berisi judul, isi, dan satu tautan. Isinya bukan janji
 * pemasaran; semuanya bisa diperiksa di aplikasinya.
 */

const kartu = [
  {
    judul: "Berkas tidak ke mana mana",
    isi: "Tidak ada unggahan dan tidak ada akun. Konversi berjalan di komputer Anda, termasuk saat internet mati.",
    tautan: { label: "Baca panduan", href: "/panduan" },
    ikon: "perisai" as const,
  },
  {
    judul: "Berkas asli tidak diubah",
    isi: "Hasil selalu berkas baru di folder yang sama, dengan nama berbeda. Berkas asli tetap utuh, jadi selalu ada salinan yang aman.",
    tautan: { label: "Lihat cara kerjanya", href: "/fitur" },
    ikon: "timbangan" as const,
  },
];

export default function BagianPrivasi() {
  return (
    <section className="pemisah">
      <div className="wadah py-20 md:py-28">
        <Muncul className="mx-auto max-w-2xl text-center">
          <h2 className="judul-bagian">Dirancang untuk menjaga berkas Anda</h2>
          <p className="lead mx-auto mt-5">
            Aplikasi konversi biasanya meminta berkas Anda diunggah ke server
            mereka. {situs.nama} memilih jalan lain.
          </p>
        </Muncul>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {kartu.map((k, i) => (
            <Muncul key={k.judul} jeda={i * 60} className="kartu flex flex-col p-7 md:p-9">
              <span className="grid size-11 place-items-center rounded-xl border border-garis bg-timbul text-tembaga">
                <Ikon nama={k.ikon} ukuran={19} />
              </span>
              <h3 className="mt-5 text-[1.1rem] font-semibold tracking-[-0.02em]">{k.judul}</h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-tinta-2">{k.isi}</p>
              <Link
                href={k.tautan.href}
                className="mt-6 inline-flex min-h-11 w-fit items-center gap-1.5 text-[13px] font-semibold text-tinta transition-colors hover:text-tembaga-teks"
              >
                {k.tautan.label}
                <Ikon nama="panah" ukuran={14} />
              </Link>
            </Muncul>
          ))}
        </div>

        <Muncul className="mt-4 grid gap-4 sm:grid-cols-2">
          {kemampuan.slice(0, 2).map((k, i) => (
            <div key={k.judul} className="flex items-start gap-3.5 rounded-xl border border-garis px-6 py-5">
              <span className="mt-0.5 shrink-0 text-tembaga">
                <Ikon nama={k.ikon} ukuran={18} />
              </span>
              <div>
                <h3 className="text-[14px] font-semibold tracking-[-0.015em]">{k.judul}</h3>
                <p className="mt-1 text-[12.5px] leading-relaxed text-tinta-2">{k.isi}</p>
              </div>
            </div>
          ))}
        </Muncul>
      </div>
    </section>
  );
}
