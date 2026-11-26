import KepalaBagian from "@/components/kepala-bagian";
import Muncul from "@/components/muncul";
import PemutarVideo from "@/components/pemutar-video";

/**
 * Bagian presentasi.
 *
 * Video ditaruh sebagai bagian yang bisa diputar, bukan latar yang berjalan
 * sendiri. Alasannya sederhana: rekaman kerja aplikasi lebih berguna saat
 * orang memutuskan menonton, bukan saat ia dilewati.
 */
export default function BagianVideo() {
  return (
    <section className="pemisah">
      <div className="wadah py-20 md:py-28">
        <KepalaBagian
          label="Lihat cara kerjanya"
          judul={
            <>
              Dua puluh satu detik,
              <br />
              <span className="text-kertas-2/45">dari berkas ke format baru.</span>
            </>
          }
          penjelas="Rekaman ini diambil dari aplikasi yang berjalan, bukan simulasi. Berkas dimasukkan, format dipilih, hasilnya muncul di folder yang sama."
        />

        <Muncul className="mt-12">
          <PemutarVideo />
        </Muncul>

        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[12.5px] text-kertas-2/40">
          <li>Tanpa suara</li>
          <li aria-hidden="true">·</li>
          <li>Rekaman aplikasi asli</li>
          <li aria-hidden="true">·</li>
          <li>1,1 MB, tidak dimuat sebelum Anda menekan putar</li>
        </ul>
      </div>
    </section>
  );
}
