import { media } from "@/lib/data";
import KepalaBagian from "@/components/kepala-bagian";
import PemutarVideo from "@/components/pemutar-video";
import Muncul from "@/components/muncul";

/**
 * Bagian video panduan.
 *
 * Videonya bukan lagi presentasi gambar diam. Isinya rekaman aplikasi yang
 * sungguhan, berjalan mengikuti urutan pemakaian: buka, masukkan berkas, pilih
 * format, jalankan, ambil hasil, atur sekali. Tiap adegan disorot pada bagian
 * yang sedang dijelaskan, dengan satu kalimat di bawahnya.
 *
 * Karena itu judul bagiannya menyebut panduan pemakaian, bukan "lihat
 * sekilas". Orang yang menekan putar harus tahu ia akan diajari sesuatu.
 */
export default function BagianVideo() {
  return (
    <section id="panduan" className="pemisah scroll-mt-24">
      <div className="wadah py-20 md:py-28">
        <KepalaBagian
          nomor="02"
          label="Panduan pemakaian"
          judul={
            <>
              Cara memakainya,
              <br />
              <span className="text-tinta-3">dari berkas pertama sampai selesai.</span>
            </>
          }
          penjelas="Rekaman aplikasi yang sesungguhnya, dengan suara yang menjelaskan tiap langkah. Sorotan menunjukkan bagian mana yang sedang dipakai."
        />

        <Muncul className="mt-12">
          <PemutarVideo />
        </Muncul>

        <div className="mt-6 grid gap-x-8 gap-y-3 text-[13.5px] text-tinta-2 sm:grid-cols-3">
          <p>
            <span className="font-mono text-[11.5px] tracking-[0.08em] text-tembaga">01</span>{" "}
            Masukkan berkas, bisa banyak sekaligus.
          </p>
          <p>
            <span className="font-mono text-[11.5px] tracking-[0.08em] text-tembaga">02</span>{" "}
            Pilih format yang memang tersedia.
          </p>
          <p>
            <span className="font-mono text-[11.5px] tracking-[0.08em] text-tembaga">03</span>{" "}
            Hasil masuk ke folder yang sama.
          </p>
        </div>

        <p className="mt-6 text-[13px] text-tinta-3">
          Durasi {media.durasi}.{" "}
          <a
            href={media.video}
            download
            className="text-tinta-2 underline-offset-4 transition-colors hover:text-tinta hover:underline"
          >
            Unduh videonya
          </a>{" "}
          kalau ingin diputar tanpa jaringan.
        </p>
      </div>
    </section>
  );
}
