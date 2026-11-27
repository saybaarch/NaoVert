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
    t: "Apakah NaoVert gratis?",
    j: "NaoVert tersedia dalam paket lisensi bulanan seharga Rp15.000 dan paket tahunan promo seharga Rp150.000. Harga asli paket tahunan adalah Rp180.000.",
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
            <span className="text-tinta-3">sampai hasil.</span>
          </>
        }
        penjelas="Tiga langkah untuk mulai, lalu jawaban atas pertanyaan yang paling sering muncul."
      />

      <div className="wadah pb-24">
        <ol className="grid gap-4 md:grid-cols-3">
          {langkah.map((l, i) => (
            <Muncul key={l.nomor} jeda={i * 60} className="kartu p-7 md:p-8">
              <span className="grid size-10 place-items-center rounded-xl bg-tinta text-[12px] font-bold text-latar">
                {l.nomor}
              </span>
              <h2 className="mt-6 text-[17px] font-semibold tracking-[-0.02em]">{l.judul}</h2>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-tinta-2">{l.isi}</p>
            </Muncul>
          ))}
        </ol>

        <section className="mx-auto mt-20 max-w-3xl">
          <div className="text-center">
            <p className="label">Pertanyaan yang sering muncul</p>
            <h2 className="judul-bagian mt-3">Sebelum mulai memakai.</h2>
          </div>
          <div className="mt-8 space-y-3">
            {tanya.map((q) => (
              <details
                key={q.t}
                className="group rounded-2xl border border-garis bg-panel px-5 shadow-[var(--bayang-kartu)] md:px-6"
              >
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 py-4">
                  <span className="flex-1 text-[14.5px] font-semibold tracking-[-0.01em] text-tinta">
                    {q.t}
                  </span>
                  <span className="shrink-0 text-tinta-3 transition-transform group-open:rotate-180">
                    <Ikon nama="panah" ukuran={16} className="rotate-90" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-5 pr-8 text-[13.5px] leading-relaxed text-tinta-2">
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
