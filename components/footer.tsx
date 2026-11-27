import Link from "next/link";
import { situs } from "@/lib/data";
import { Tanda } from "@/components/ikon";

/*
 * Kaki halaman.
 *
 * Mengikuti acuan: blok gelap penuh, merek dan keterangan di kiri, lalu
 * kelompok tautan yang benar benar ada. Tidak ada tautan karangan.
 */

const kolom = [
  {
    judul: "Produk",
    tautan: [
      { label: "Fitur", href: "/fitur" },
      { label: "Matriks format", href: "/format" },
      { label: "Unduh Windows", href: "/unduh" },
    ],
  },
  {
    judul: "Lisensi",
    tautan: [
      { label: "Harga", href: "/harga" },
      { label: "Lisensi bulanan", href: "/harga/bulanan" },
      { label: "Lisensi tahunan", href: "/harga/tahunan" },
      { label: "Pembayaran QRIS", href: "/harga/bayar" },
    ],
  },
  {
    judul: "Sumber daya",
    tautan: [
      { label: "Panduan", href: "/panduan" },
      { label: "Tentang", href: "/tentang" },
    ],
  },
];

export default function Footer() {
  const tahun = new Date().getFullYear();

  return (
    <footer className="bg-[#1b1d20] text-[#f5f2ec]">
      <div className="wadah py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-4">
            <div className="flex items-center gap-2.5">
              <Tanda ukuran={26} />
              <span className="text-[17px] font-semibold tracking-[-0.02em]">{situs.nama}</span>
            </div>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-[#f5f2ec]/65">
              Utilitas konversi berkas desktop untuk Windows. Seluruh proses
              berjalan luring, tanpa unggahan dan tanpa antrean server.
            </p>
            <p className="mt-5 text-[11.5px] text-[#f5f2ec]/45">
              Versi {situs.versi}, {situs.sistem}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8">
            {kolom.map((k) => (
              <div key={k.judul}>
                <p className="text-[12px] font-semibold text-[#f5f2ec]">{k.judul}</p>
                <ul className="mt-3 flex flex-col">
                  {k.tautan.map((t) => (
                    <li key={t.href}>
                      <Link
                        href={t.href}
                        className="inline-flex min-h-9 items-center text-[13px] text-[#f5f2ec]/65 transition-colors hover:text-[#f5f2ec]"
                      >
                        {t.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[#f5f2ec]/15 pt-7 text-[12px] text-[#f5f2ec]/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {tahun} {situs.nama}. Dibuat oleh{" "}
            <a
              href={situs.pembuatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f5f2ec]/85 underline-offset-4 transition-colors hover:text-[#e3a77e] hover:underline"
            >
              {situs.pembuat}
            </a>
            .
          </p>
          <a
            href={situs.pembuatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#f5f2ec]/65 transition-colors hover:text-[#f5f2ec]"
          >
            {situs.pembuat}, Pontianak
          </a>
        </div>
      </div>
    </footer>
  );
}
