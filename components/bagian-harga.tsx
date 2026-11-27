import Link from "next/link";
import { paket, rupiah } from "@/lib/harga";
import Muncul from "@/components/muncul";
import Ikon from "@/components/ikon";

/**
 * Kotak harga ringkas.
 *
 * Mengikuti acuan: satu kotak lebar berisi judul dan penjelas di kiri, tombol
 * di kanan, lalu dua harga sejajar di bawahnya. Halaman harga memegang seluruh
 * perbandingan; kotak ini hanya memberi jalan masuk.
 */
export default function BagianHarga() {
  return (
    <section id="harga" className="scroll-mt-24 pb-20 md:pb-28">
      <div className="wadah">
        <Muncul className="kartu overflow-hidden px-6 py-12 md:px-12 md:py-16">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="judul-kecil">Paket dan harga</h2>
              <p className="mt-2.5 text-[14px] leading-relaxed text-tinta-2">
                NaoVert tersedia dalam paket bulanan dan tahunan untuk penggunaan
                pribadi. Semua kemampuan aplikasi terbuka di kedua paket.
              </p>
            </div>
            <Link href="/harga" className="tombol shrink-0">
              Pelajari lebih lanjut
              <Ikon nama="panah" ukuran={16} />
            </Link>
          </div>

          <div className="mt-10 grid gap-3 border-t border-garis pt-8 sm:grid-cols-2">
            {paket.map((p) => (
              <Link
                key={p.id}
                href={`/harga/${p.id}`}
                className="group flex items-baseline justify-between gap-4 rounded-xl border border-garis px-5 py-4 transition-colors hover:border-tembaga/45 hover:bg-timbul"
              >
                <span>
                  <span className="block text-[13.5px] font-semibold text-tinta">{p.nama}</span>
                  <span className="mt-0.5 block text-[11.5px] text-tinta-3">{p.durasi}</span>
                </span>
                <span className="flex items-baseline gap-1.5">
                  <span className="text-[20px] font-semibold tabular-nums tracking-[-0.02em]">
                    {rupiah.format(p.harga)}
                  </span>
                  <span className="text-[11.5px] text-tinta-3">{p.periode}</span>
                </span>
              </Link>
            ))}
          </div>
        </Muncul>
      </div>
    </section>
  );
}
