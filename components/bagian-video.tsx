import { media } from "@/lib/data";
import KepalaBagian from "@/components/kepala-bagian";
import PemutarVideo from "@/components/pemutar-video";
import Muncul from "@/components/muncul";

export default function BagianVideo() {
  return (
    <section id="panduan" className="pemisah scroll-mt-24">
      <div className="wadah py-20 md:py-24">
        <KepalaBagian
          label="Panduan pemakaian"
          judul={
            <>
              Cara memakainya,
              <br />
              <span className="text-tinta-3">dari berkas pertama sampai selesai.</span>
            </>
          }
          penjelas="Rekaman aplikasi yang sesungguhnya, tanpa suara. Tiap langkah dijelaskan lewat teks dan sorotan di dalam gambar, jadi bisa ditonton di mana saja."
          tengah
        />

        <Muncul className="mx-auto mt-12 max-w-4xl">
          <PemutarVideo />
        </Muncul>

        <div className="mx-auto mt-6 grid max-w-4xl gap-x-8 gap-y-3 text-[13px] text-tinta-2 sm:grid-cols-3">
          <p>
            <span className="font-mono text-[11px] tracking-[0.08em] text-tembaga">01</span>{" "}
            Masukkan berkas, bisa banyak sekaligus.
          </p>
          <p>
            <span className="font-mono text-[11px] tracking-[0.08em] text-tembaga">02</span>{" "}
            Pilih format yang memang tersedia.
          </p>
          <p>
            <span className="font-mono text-[11px] tracking-[0.08em] text-tembaga">03</span>{" "}
            Hasil masuk ke folder yang sama.
          </p>
        </div>

        <p className="mx-auto mt-6 max-w-4xl text-[13px] text-tinta-3">
          Durasi {media.durasi}.{" "}
          <a
            href={media.video}
            download
            className="inline-flex min-h-11 min-w-11 items-center text-tinta-2 underline-offset-4 transition-colors hover:text-tinta hover:underline"
          >
            Unduh videonya
          </a>{" "}
          kalau ingin diputar tanpa jaringan.
        </p>
      </div>
    </section>
  );
}
