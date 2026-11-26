import type { Metadata } from "next";
import Link from "next/link";
import KepalaHalaman from "@/components/kepala-halaman";
import Muncul from "@/components/muncul";
import Ikon from "@/components/ikon";
import { langkah, namaMesin } from "@/lib/data";

export const metadata: Metadata = {
  title: "Panduan",
  description: "Cara memasang NaoVert, mengubah berkas, dan memakai menu klik kanan di File Explorer.",
};

const tanya = [
  {
    t: "Apakah berkas saya diunggah ke internet?",
    j: "Tidak. Seluruh konversi berjalan di komputer Anda. NaoVert tidak mengirim berkas ke mana pun, dan tidak butuh sambungan internet untuk bekerja.",
  },
  {
    t: "Kenapa beberapa format tidak muncul sebagai tujuan?",
    j: "Karena mesin yang dipakai memang tidak bisa menulis format itu. NaoVert hanya menampilkan format yang benar benar bisa dihasilkan, jadi tidak ada konversi yang gagal di tengah jalan karena alasannya sepele.",
  },
  {
    t: "Apakah berkas asli diubah?",
    j: "Tidak pernah. Hasil konversi selalu berkas baru di folder yang sama dengan berkas aslinya, dengan nama berbeda. Berkas asli tetap utuh.",
  },
  {
    t: "Perlu memasang mesin konversi sendiri?",
    j: `Tidak perlu. ${namaMesin.length} mesin sudah ikut terpasang bersama aplikasi. Tidak ada langkah tambahan setelah pemasangan selesai.`,
  },
  {
    t: "Apakah perlu akun atau kunci lisensi?",
    j: "Tidak. NaoVert gratis dan tidak meminta akun. Tidak ada kunci yang harus dimasukkan, dan tidak ada batas jumlah berkas.",
  },
];

export default function HalamanPanduan() {
  return (
    <>
      <KepalaHalaman
        label="Panduan"
        judul={
          <>
            Dari pemasang
            <br />
            <span className="text-kertas-2/45">sampai hasil.</span>
          </>
        }
        penjelas="Tiga langkah untuk mulai, lalu jawaban atas pertanyaan yang paling sering muncul."
      />

      <div className="wadah pb-24">
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-garis bg-garis md:grid-cols-3">
          {langkah.map((l, i) => (
            <Muncul key={l.nomor} jeda={i * 70} className="bg-ink p-7 md:p-8">
              <span className="font-mono text-[12px] tracking-[0.1em] text-tembaga">{l.nomor}</span>
              <h2 className="mt-4 text-[16.5px] font-semibold tracking-[-0.02em]">{l.judul}</h2>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-kertas-2/50">{l.isi}</p>
            </Muncul>
          ))}
        </ol>

        <section className="mt-20">
          <p className="label">Pertanyaan yang sering muncul</p>
          <div className="mt-5 border-t border-garis">
            {tanya.map((q) => (
              <details key={q.t} className="group border-b border-garis">
                <summary className="flex cursor-pointer list-none items-center gap-4 py-5 transition-colors hover:bg-white/[0.02]">
                  <span className="flex-1 text-[15.5px] font-medium tracking-[-0.015em] text-kertas/90">
                    {q.t}
                  </span>
                  <span className="shrink-0 text-kertas-2/30 transition-transform group-open:rotate-45">
                    <Ikon nama="tutup" ukuran={16} />
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 pr-8 text-[14px] leading-relaxed text-kertas-2/55">
                  {q.j}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-16 flex flex-wrap gap-3">
          <Link href="/unduh" className="tombol">
            <Ikon nama="unduh" ukuran={18} />
            Unduh NaoVert
          </Link>
          <Link href="/format" className="tombol tombol-garis">
            Lihat daftar format
            <Ikon nama="panah" ukuran={17} />
          </Link>
        </div>
      </div>
    </>
  );
}
