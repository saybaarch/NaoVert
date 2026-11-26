import Link from "next/link";
import { navigasi, situs } from "@/lib/data";
import { Tanda } from "@/components/ikon";

/**
 * Kaki halaman.
 *
 * Tiga bagian: tanda dan keterangan singkat, dua kelompok tautan yang isinya
 * benar benar ada, lalu baris penutup berisi pembuat dan sistem yang didukung.
 * Tidak ada kolom Legal kosong dan tidak ada tautan sosial yang belum tentu
 * hidup.
 */
export default function Footer() {
  const tahun = new Date().getFullYear();

  return (
    <footer className="pemisah mt-24">
      <div className="wadah py-12 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Tanda ukuran={24} />
              <span className="text-[15.5px] font-semibold tracking-[-0.02em]">
                {situs.nama}
              </span>
            </div>
            <p className="mt-3.5 text-[13.5px] leading-relaxed text-tinta-2">
              Konverter berkas untuk Windows. Seluruh proses berjalan di
              komputer Anda, tanpa unggahan dan tanpa akun.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-8 text-[13.5px]">
            <div>
              <p className="label mb-3">Halaman</p>
              <ul className="flex flex-col gap-2">
                {navigasi.map((n) => (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      className="text-tinta-2 transition-colors hover:text-tinta"
                    >
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label mb-3">NaoVert</p>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link href="/unduh" className="text-tinta-2 transition-colors hover:text-tinta">
                    Unduh
                  </Link>
                </li>
                <li>
                  <Link href="/panduan" className="text-tinta-2 transition-colors hover:text-tinta">
                    Panduan
                  </Link>
                </li>
                <li>
                  <Link href="/tentang" className="text-tinta-2 transition-colors hover:text-tinta">
                    Tentang
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pemisah mt-10 flex flex-col gap-3 pt-6 text-[12.5px] text-tinta-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {tahun} {situs.nama}. Dibuat oleh{" "}
            <a
              href={situs.pembuatUrl}
              className="text-tinta-2 underline-offset-4 transition-colors hover:text-tinta hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {situs.pembuat}
            </a>
            .
          </p>
          <p className="font-mono text-[11.5px] uppercase tracking-[0.07em]">
            {situs.sistem}
          </p>
        </div>
      </div>
    </footer>
  );
}
