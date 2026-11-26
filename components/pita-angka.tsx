import { angka } from "@/lib/data";
import Muncul from "@/components/muncul";

/**
 * Pita angka.
 *
 * Empat angka saja, dipisah garis tipis, dihitung dari data format yang
 * benar benar ada. Tidak ada angka pembanding, tidak ada klaim pertumbuhan.
 */
export default function PitaAngka() {
  return (
    <section className="pemisah">
      <div className="wadah">
        <dl className="grid grid-cols-2 divide-garis md:grid-cols-4 md:divide-x">
          {angka.map((a, i) => (
            <Muncul
              key={a.satuan}
              jeda={i * 60}
              className="border-b border-garis px-1 py-8 md:border-b-0 md:px-7 md:first:pl-0 md:py-10"
            >
              <dd className="font-mono text-[2.1rem] font-semibold leading-none tracking-[-0.03em] md:text-[2.6rem]">
                {a.nilai}
              </dd>
              <dt className="mt-3 text-[12.5px] text-kertas-2/45">{a.satuan}</dt>
            </Muncul>
          ))}
        </dl>
      </div>
    </section>
  );
}
