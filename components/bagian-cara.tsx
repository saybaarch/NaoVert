import { langkah } from "@/lib/data";
import KepalaBagian from "@/components/kepala-bagian";
import Muncul from "@/components/muncul";

/**
 * Tiga langkah kerja.
 *
 * Ditulis sebagai daftar bernomor sungguhan, bukan tiga kartu sejajar. Langkah
 * itu berurutan, dan bentuknya harus terbaca berurutan juga: satu kolom tipis
 * dengan garis penghubung, angka di kiri, kalimat di kanan.
 *
 * Tidak memakai kotak berisi bayangan. Pemisahnya garis rambut, sama seperti
 * tabel dan daftar di halaman format.
 */
export default function BagianCara() {
  return (
    <section id="cara" className="pemisah scroll-mt-24">
      <div className="wadah py-20 md:py-28">
        <KepalaBagian
          nomor="03"
          label="Cara kerja"
          judul={
            <>
              Tiga langkah,
              <br />
              <span className="text-tinta-3">tanpa pengaturan rumit.</span>
            </>
          }
          penjelas="Tidak ada profil keluaran yang harus disusun lebih dulu, tidak ada folder keluaran yang harus ditentukan. Aplikasi mengikuti berkas yang Anda masukkan."
        />

        <ol className="mt-12 max-w-3xl">
          {langkah.map((l, i) => (
            <Muncul
              as="li"
              key={l.nomor}
              jeda={i * 70}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 border-t border-garis py-7 last:border-b"
            >
              <span className="mt-0.5 font-mono text-[12px] font-medium tracking-[0.1em] text-tembaga">
                {l.nomor}
              </span>
              <div>
                <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-tinta">
                  {l.judul}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-tinta-2">
                  {l.isi}
                </p>
              </div>
            </Muncul>
          ))}
        </ol>
      </div>
    </section>
  );
}
