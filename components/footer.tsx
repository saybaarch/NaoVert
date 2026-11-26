import Link from "next/link";
import { navigasi, situs } from "@/lib/data";
import { Tanda } from "@/components/ikon";

/**
 * Kaki halaman.
 *
 * Satu tugas: memberi jalan keluar yang jelas. Nama pembuat ditulis dengan
 * tautan ke sayba.id, dan itu satu-satunya tautan luar di situs ini.
 */
export default function Footer() {
  const tahun = new Date().getFullYear();

  return (
    <footer className="pemisah mt-24">
      <div className="wadah py-12 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Tanda ukuran={26} />
              <span className="text-[16px] font-semibold tracking-[-0.02em]">{situs.nama}</span>
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-kertas-2/50">
              Konverter berkas untuk Windows. Seluruh proses berjalan di komputer Anda,
              tanpa unggahan dan tanpa akun.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-[13.5px] sm:grid-cols-2">
            <div>
              <p className="label mb-3">Situs</p>
              <ul className="flex flex-col gap-2">
                {navigasi.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="text-kertas-2/60 transition-colors hover:text-kertas">
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
                  <Link href="/unduh" className="text-kertas-2/60 transition-colors hover:text-kertas">
                    Unduh
                  </Link>
                </li>
                <li>
                  <Link href="/panduan" className="text-kertas-2/60 transition-colors hover:text-kertas">
                    Panduan
                  </Link>
                </li>
                <li>
                  <Link href="/tentang" className="text-kertas-2/60 transition-colors hover:text-kertas">
                    Tentang
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pemisah mt-10 flex flex-col gap-3 pt-6 text-[12.5px] text-kertas-2/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {tahun} {situs.nama}. Dibuat oleh{" "}
            <a
              href={situs.pembuatUrl}
              className="text-kertas-2/70 underline-offset-4 transition-colors hover:text-kertas hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {situs.pembuat}
            </a>
            .
          </p>
          <p className="font-mono text-[11.5px] tracking-[0.08em] uppercase">
            Windows 10 dan 11, 64 bit
          </p>
        </div>
      </div>
    </footer>
  );
}
