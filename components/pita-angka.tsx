import { angka } from "@/lib/data";
import Muncul from "@/components/muncul";
import AngkaHitung from "@/components/angka-hitung";
import Ikon from "@/components/ikon";

/**
 * Pita angka.
 *
 * Lima angka, semuanya dihitung dari data format yang benar benar ada, ditambah
 * satu pernyataan yang bisa diperiksa sendiri (nol byte terkirim). Angkanya
 * naik dari nol saat bagian ini masuk layar, sekali saja.
 */
const keterangan = [
  "Raster, CAD, PDF, hingga font",
  "Dikenali secara presisi",
  "Matriks lintas ekstensi",
  "FFmpeg, libvips, Pandoc, dll.",
  "Nol byte terkirim ke internet",
];

export default function PitaAngka() {
  return (
    <section className="border-y border-garis bg-panel/60">
      <div className="wadah">
        <dl className="grid grid-cols-2 md:grid-cols-5">
          {angka.map((a, i) => (
            <Muncul
              key={a.satuan}
              jeda={i * 50}
              className="space-y-1.5 border-b border-garis py-8 md:border-b-0 md:border-r md:px-7 md:py-10 md:first:pl-0 md:last:border-r-0"
            >
              <dd className="flex items-center gap-1.5 text-[1.9rem] font-bold leading-none tracking-[-0.03em] text-tinta md:text-[2.1rem]">
                <AngkaHitung nilai={a.nilai} />
              </dd>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-tinta-3">
                {a.satuan}
              </dt>
              <p className="text-[12.5px] leading-snug text-tinta-2">{keterangan[i]}</p>
            </Muncul>
          ))}
          <Muncul
            jeda={200}
            className="space-y-1.5 border-b border-garis py-8 md:border-b-0 md:px-7 md:py-10 md:last:pr-0"
          >
            <dd className="flex items-center gap-1.5 text-[1.9rem] font-bold leading-none tracking-[-0.03em] text-tinta md:text-[2.1rem]">
              100%
              <span className="text-tembaga">
                <Ikon nama="perisai" ukuran={20} />
              </span>
            </dd>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-tinta-3">
              Lokal &amp; privat
            </dt>
            <p className="text-[12.5px] leading-snug text-tinta-2">Berkas tidak diunggah</p>
          </Muncul>
        </dl>
      </div>
    </section>
  );
}
