import { langkah } from "@/lib/data";
import KepalaBagian from "@/components/kepala-bagian";
import Muncul from "@/components/muncul";

/**
 * Tiga langkah kerja.
 *
 * Ditulis sebagai daftar bernomor sungguhan, bukan tiga kartu sejajar.
 * Langkah itu berurutan, dan bentuknya harus terbaca berurutan juga.
 */
export default function BagianCara() {
  return (
    <section id="cara" className="pemisah scroll-mt-24">
      <div className="wadah py-20 md:py-28">
        <KepalaBagian
          nomor="02"
          label="Cara kerja"
          judul={
            <>
              Tiga langkah,
              <br />
              <span className="text-kertas-2/45">tanpa pengaturan rumit.</span>
            </>
          }
        />

        <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-garis bg-garis md:grid-cols-3">
          {langkah.map((l, i) => (
            <Muncul as="li" key={l.nomor} jeda={i * 80} className="bg-ink p-7 md:p-9">
              <span className="font-mono text-[12px] tracking-[0.1em] text-tembaga">
                {l.nomor}
              </span>
              <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.02em]">{l.judul}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-kertas-2/55">{l.isi}</p>
            </Muncul>
          ))}
        </ol>
      </div>
    </section>
  );
}
