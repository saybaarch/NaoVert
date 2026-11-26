import type { Metadata } from "next";
import Link from "next/link";
import KepalaHalaman from "@/components/kepala-halaman";
import Muncul from "@/components/muncul";
import Ikon from "@/components/ikon";
import { kemampuan, namaMesin, situs } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tentang",
  description: `Tentang ${situs.nama}, konverter berkas buatan ${situs.pembuat} dari Pontianak.`,
};

export default function HalamanTentang() {
  return (
    <>
      <KepalaHalaman
        label="Tentang"
        judul={
          <>
            Dibuat karena
            <br />
            <span className="text-kertas-2/45">memasang itu melelahkan.</span>
          </>
        }
        penjelas={`${situs.nama} berawal dari satu masalah sederhana: mengubah satu berkas seharusnya tidak perlu memasang lima program lain lebih dulu.`}
      />

      <div className="wadah pb-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
          <Muncul>
            <div className="space-y-5 text-[15px] leading-relaxed text-kertas-2/60">
              <p>
                Alat konversi yang ada biasanya bekerja dengan dua cara: mengunggah
                berkas Anda ke server mereka, atau menyuruh Anda memasang mesin
                tambahan satu per satu. Cara pertama membuat berkas pribadi keluar
                dari komputer Anda. Cara kedua membuat pekerjaan tertunda sebelum
                sempat dimulai.
              </p>
              <p>
                {situs.nama} memilih jalan lain. Seluruh mesin konversi ikut
                terpasang bersama aplikasi, dan semuanya berjalan di komputer Anda.
                Tidak ada unggahan, tidak ada akun, dan tidak ada antrean.
              </p>
              <p>
                Aplikasi ini dibuat oleh{" "}
                <a
                  href={situs.pembuatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kertas/85 underline decoration-garis-2 underline-offset-4 transition-colors hover:text-kertas"
                >
                  {situs.pembuat}
                </a>
                , studio pengembangan perangkat lunak dan sistem informasi di Pontianak.
              </p>
            </div>

            <div className="mt-10 rounded-xl border border-garis bg-ink-2 p-6">
              <p className="label">Mesin yang ikut terpasang</p>
              <p className="mt-3 font-mono text-[12.5px] leading-relaxed text-kertas-2/55">
                {namaMesin.join(" · ")}
              </p>
              <p className="mt-4 text-[12.5px] leading-relaxed text-kertas-2/35">
                Daftar ini dibaca langsung dari data kemampuan aplikasi, bukan
                ditulis terpisah, jadi selalu sama dengan yang benar benar ada.
              </p>
            </div>
          </Muncul>

          <div className="grid gap-px self-start overflow-hidden rounded-2xl border border-garis bg-garis">
            {kemampuan.map((k, i) => (
              <Muncul key={k.judul} jeda={i * 45} className="bg-ink p-6">
                <span className="text-kertas-2/45">
                  <Ikon nama={k.ikon} ukuran={20} />
                </span>
                <h2 className="mt-4 text-[14.5px] font-semibold tracking-[-0.015em]">{k.judul}</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-kertas-2/50">{k.isi}</p>
              </Muncul>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap gap-3">
          <Link href="/unduh" className="tombol">
            <Ikon nama="unduh" ukuran={18} />
            Unduh NaoVert
          </Link>
          <Link href="/panduan" className="tombol tombol-garis">
            Baca panduan
            <Ikon nama="panah" ukuran={17} />
          </Link>
        </div>
      </div>
    </>
  );
}
