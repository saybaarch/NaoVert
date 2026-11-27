import Image from "next/image";
import { tangkapan } from "@/lib/data";
import KepalaBagian from "@/components/kepala-bagian";
import Muncul from "@/components/muncul";
import MiringKursor from "@/components/miring-kursor";

const gambar = [
  {
    src: tangkapan.berkas,
    alt: "Jendela utama NaoVert berisi empat berkas gambar dengan pilihan format tujuan di bawahnya.",
    judul: "Berkas masuk",
    ket: "Empat berkas sekaligus, masing masing dikenali jenisnya sendiri.",
  },
  {
    src: tangkapan.gabung,
    alt: "Dialog Gabung Dokumen dengan pilihan keluaran PDF dan Word serta daftar urutan halaman.",
    judul: "Gabung dokumen",
    ket: "PDF, Word, gambar, dan tabel jadi satu berkas, urutannya diatur per baris.",
  },
  {
    src: tangkapan.pengaturan,
    alt: "Panel pengaturan NaoVert berisi status mesin konversi, tema, dan integrasi Windows.",
    judul: "Pengaturan",
    ket: "Mesin, tema, dan integrasi Windows dalam satu panel yang bisa ditutup.",
  },
  {
    src: tangkapan.terang,
    alt: "Jendela NaoVert dalam tema terang dengan latar krem dan aksen tembaga.",
    judul: "Tema terang",
    ket: "Tema terang bawaan aplikasi, bukan lapisan warna di atas tema gelap.",
  },
];

export default function BagianGaleri() {
  return (
    <section id="tampilan" className="pemisah scroll-mt-24">
      <div className="wadah py-20 md:py-24">
        <KepalaBagian
          label="Tampilan"
          judul={
            <>
              Seperti apa
              <br />
              <span className="text-tinta-3">aplikasinya.</span>
            </>
          }
          penjelas="Tangkapan di bawah diambil dari aplikasi versi terbaru, bukan gambar rancangan dan bukan aset lama."
          tengah
        />

        <div className="geser-kejutan mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0">
          {gambar.map((g, i) => (
            <Muncul
              key={g.judul}
              jeda={i * 50}
              className={
                i === 0
                  ? "w-[86vw] shrink-0 snap-center md:col-span-2 md:w-auto"
                  : "w-[86vw] shrink-0 snap-center md:w-auto"
              }
            >
              <figure className="m-0">
                <MiringKursor>
                  <div className="overflow-hidden rounded-2xl border border-garis bg-panel shadow-[var(--bayang-kartu)]">
                    <div
                      className="flex items-center gap-1.5 border-b border-garis bg-timbul/60 px-3 py-2"
                      aria-hidden="true"
                    >
                      <i className="size-1.5 rounded-full bg-tinta-3/35" />
                      <i className="size-1.5 rounded-full bg-tinta-3/35" />
                      <i className="size-1.5 rounded-full bg-tinta-3/35" />
                    </div>
                    <Image
                      src={g.src}
                      alt={g.alt}
                      width={2480}
                      height={1560}
                      sizes={
                        i === 0
                          ? "(max-width: 767px) 86vw, 1120px"
                          : "(max-width: 767px) 86vw, 550px"
                      }
                      className="h-auto w-full"
                    />
                  </div>
                </MiringKursor>
                <figcaption className="mt-3 text-[12.5px] leading-relaxed text-tinta-3">
                  <b className="font-medium text-tinta-2">{g.judul}</b>. {g.ket}
                </figcaption>
              </figure>
            </Muncul>
          ))}
        </div>
      </div>
    </section>
  );
}
