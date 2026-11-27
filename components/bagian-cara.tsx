import { langkah } from "@/lib/data";
import KepalaBagian from "@/components/kepala-bagian";
import Muncul from "@/components/muncul";
import Ikon from "@/components/ikon";

const langkahTampil = [
  ...langkah,
  {
    nomor: "04",
    judul: "Berkas tetap di komputer",
    isi: "Tidak ada unggahan dan tidak ada antrean server. Konversi berjalan lokal, termasuk ketika internet tidak tersedia.",
  },
];

export default function BagianCara() {
  return (
    <section id="cara" className="pemisah scroll-mt-24">
      <div className="wadah py-20 md:py-24">
        <KepalaBagian
          label="Cara kerja"
          judul={
            <>
              Empat langkah sederhana,
              <br />
              <span className="text-tinta-3">tanpa pengaturan rumit.</span>
            </>
          }
          penjelas="Tarik berkas, pilih tujuan, lalu jalankan. NaoVert menangani mesin dan lokasi hasilnya tanpa membuat Anda mengatur profil konversi."
          tengah
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {langkahTampil.map((l, i) => (
            <Muncul key={l.nomor} jeda={i * 50} className="kartu p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-tinta text-[12px] font-bold text-latar">
                  {l.nomor}
                </span>
                <span className="text-tinta-3">
                  <Ikon nama={i === 3 ? "perisai" : "centang"} ukuran={17} />
                </span>
              </div>
              <h3 className="mt-6 text-[16px] font-semibold tracking-[-0.02em]">{l.judul}</h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-tinta-2">{l.isi}</p>
            </Muncul>
          ))}
        </div>
      </div>
    </section>
  );
}
