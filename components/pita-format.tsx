import { daftarFormatKeluar } from "@/lib/data";

/**
 * Pita format bergulir.
 *
 * Bukan hiasan: daftar ini memberi tahu seberapa luas jangkauan aplikasi dalam
 * satu pandangan, tanpa memaksa orang membaca tabel. Gerakannya lambat dan
 * berhenti sendiri saat pengguna memilih mengurangi gerakan.
 */
export default function PitaFormat() {
  const isi = [...daftarFormatKeluar, ...daftarFormatKeluar];

  return (
    <div className="overflow-hidden border-y border-garis bg-timbul/40 py-4" aria-hidden="true">
      <div className="pita-isi flex w-max gap-2.5">
        {isi.map((f, i) => (
          <span
            key={`${f}-${i}`}
            className="rounded-full border border-garis bg-panel px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-tinta-2"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
