import { bab } from "@/lib/data";
import Muncul from "@/components/muncul";

/**
 * Bab bercerita.
 *
 * Tiga bab pendek, masing-masing satu layar. Nomornya kecil di atas, judulnya
 * besar, penjelasnya pendek. Bentuk ini diambil dari halaman acuan: orang
 * membaca berurutan, bukan memindai daftar manfaat.
 *
 * Garis tipis di atas tiap bab bukan hiasan, melainkan penanda urutan supaya
 * posisi baca selalu jelas.
 */
export default function BagianBab() {
  return (
    <div className="pemisah">
      {bab.map((b) => (
        <section key={b.nomor} className="border-b border-garis">
          <div className="wadah py-20 md:py-32">
            <Muncul className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[11.5px] tracking-[0.16em] text-kertas-2/35">
                {b.nomor}
              </p>
              <h2 className="judul-bagian mt-6">
                {b.judul.map((baris, i) => (
                  <span
                    key={baris}
                    className={i === 0 ? "block" : "block text-kertas-2/40"}
                  >
                    {baris}
                  </span>
                ))}
              </h2>
              <p className="lead mx-auto mt-6 max-w-xl">{b.isi}</p>
            </Muncul>
          </div>
        </section>
      ))}
    </div>
  );
}
