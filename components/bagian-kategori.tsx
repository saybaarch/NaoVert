import Link from "next/link";
import { keluarga, jumlahTujuan } from "@/lib/data";
import KepalaBagian from "@/components/kepala-bagian";
import Muncul from "@/components/muncul";
import Ikon from "@/components/ikon";

/**
 * Daftar kategori.
 *
 * Bentuknya baris, bukan kotak kartu. Alasannya: kategori dibaca sebagai
 * daftar kemampuan, dan baris bernomor dengan garis tipis membuat tiga belas
 * jenis terbaca dalam satu pandangan tanpa perlu menggulir jauh.
 */
export default function BagianKategori() {
  return (
    <section id="kemampuan" className="pemisah scroll-mt-24">
      <div className="wadah py-20 md:py-28">
        <KepalaBagian
          nomor="01"
          label="Yang bisa diubah"
          judul={
            <>
              Tiga belas kategori,
              <br />
              <span className="text-tinta-3">satu cara kerja.</span>
            </>
          }
          penjelas="Setiap kategori punya mesin sendiri yang dipilih menurut jenis berkasnya. Anda tidak perlu tahu mesin mana yang dipakai, cukup pilih berkas lalu pilih format tujuan."
        />

        <div className="mt-14 border-t border-garis">
          {keluarga.map((k, i) => (
            <Muncul key={k.id} jeda={Math.min(i * 40, 240)}>
              <details className="group border-b border-garis">
                <summary className="flex cursor-pointer list-none items-baseline gap-4 py-5 pr-2 transition-colors hover:bg-timbul md:gap-6 md:py-6">
                  <span className="w-6 shrink-0 font-mono text-[11.5px] text-tinta-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="judul-kecil flex-1 text-tinta group-open:text-tinta">
                    {k.judul}
                  </span>
                  <span className="hidden shrink-0 font-mono text-[11.5px] text-tinta-3 sm:block">
                    {k.masuk.length} masuk / {k.keluar.length} keluar
                  </span>
                  <span className="shrink-0 text-tinta-3 transition-transform group-open:rotate-45">
                    <Ikon nama="tutup" ukuran={16} />
                  </span>
                </summary>

                <div className="grid gap-6 pb-7 pl-10 pr-2 md:grid-cols-[1.4fr_1fr] md:pl-16">
                  <div>
                    <p className="text-[14.5px] leading-relaxed text-tinta-2">{k.detail}</p>
                    {k.catatan && (
                      <p className="mt-3 border-l-2 border-tembaga/40 pl-3 text-[13px] leading-relaxed text-tinta-3">
                        {k.catatan}
                      </p>
                    )}
                  </div>
                  <div className="text-[12.5px]">
                    <p className="label mb-2">Mesin</p>
                    <p className="font-mono text-tinta-2">{k.mesin}</p>
                    <p className="label mb-2 mt-4">Contoh keluaran</p>
                    <p className="font-mono uppercase leading-relaxed text-tinta-3">
                      {k.keluar.slice(0, 10).join(" · ")}
                    </p>
                  </div>
                </div>
              </details>
            </Muncul>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/format" className="tombol tombol-garis">
            Cari format tertentu
            <Ikon nama="panah" ukuran={17} />
          </Link>
          <span className="text-[12.5px] text-tinta-3">
            Daftar lengkap berisi {jumlahTujuan} tujuan konversi, bisa dicari per nama format.
          </span>
        </div>
      </div>
    </section>
  );
}
