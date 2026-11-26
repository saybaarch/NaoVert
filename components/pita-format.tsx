import { daftarFormatKeluar } from "@/lib/data";

/**
 * Pita format bergulir.
 *
 * Bukan hiasan: daftar ini memberi tahu seberapa luas jangkauan aplikasi dalam
 * satu pandangan, tanpa memaksa orang membaca tabel. Gerakannya lambat dan
 * berhenti sendiri saat pengguna memilih mengurangi gerakan.
 *
 * Isinya digandakan supaya tidak ada celah saat pita berulang. Pita diberi
 * penanda `aria-hidden` karena hanya pengulangan visual; daftar lengkap yang
 * bisa dibaca ada di halaman format.
 */
export default function PitaFormat() {
  const isi = [...daftarFormatKeluar, ...daftarFormatKeluar];

  return (
    <div className="overflow-hidden border-y border-garis py-4" aria-hidden="true">
      <div className="pita-isi flex w-max gap-3">
        {isi.map((f, i) => (
          <span
            key={`${f}-${i}`}
            className="rounded-md border border-garis px-3.5 py-1.5 font-mono text-[11.5px] uppercase tracking-[0.1em] text-tinta-3"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
