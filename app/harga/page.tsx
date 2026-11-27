import type { Metadata } from "next";
import Link from "next/link";
import KartuHarga from "@/components/kartu-harga";
import Ikon from "@/components/ikon";
import Muncul from "@/components/muncul";
import { paket } from "@/lib/harga";
import { jumlahEkstensi, jumlahTujuan, namaMesin } from "@/lib/data";

export const metadata: Metadata = {
  title: "Harga & lisensi",
  description:
    "Pilih NaoVert bulanan Rp15.000 atau tahunan promo Rp150.000. Bayar dengan QRIS, status lunas diperiksa otomatis.",
};

const tanya = [
  {
    t: "Kenapa harga tahunan memiliki harga coret?",
    j: "Harga asli paket tahunan adalah Rp15.000 dikalikan 12 bulan, yaitu Rp180.000. Harga promo yang berlaku sekarang adalah Rp150.000, jadi hemat Rp30.000.",
  },
  {
    t: "Apakah paket bulanan diperpanjang otomatis?",
    j: "Tidak. Paket bulanan aktif selama 30 hari. Anda dapat memilih perpanjangan atau pindah ke paket tahunan saat masa aktif selesai.",
  },
  {
    t: "Bagaimana cara membayar?",
    j: "Buka halaman pembayaran, pilih paket, lalu pindai kode QRIS dengan aplikasi bank atau e-wallet. Nominal akhir diberi kode unik supaya pembayaran bisa dicocokkan otomatis.",
  },
  {
    t: "Apakah konversi tetap berjalan tanpa internet?",
    j: "Ya. Seluruh mesin konversi berjalan di komputer Anda. Internet hanya diperlukan untuk membuka situs atau melakukan pembayaran, bukan untuk mengubah berkas.",
  },
  {
    t: "Apa yang saya terima setelah membayar?",
    j: "Nomor pesanan menjadi bukti pembelian. Lisensi dibuat dari nomor pesanan dan alamat email yang Anda isi. Simpan nomor pesanan sampai aktivasi selesai.",
  },
];

const bukti = [
  { angka: `${jumlahEkstensi}`, teks: "jenis berkas dikenali" },
  { angka: `${jumlahTujuan}`, teks: "tujuan konversi" },
  { angka: `${namaMesin.length}`, teks: "mesin ikut terpasang" },
];

export default function HalamanHarga() {
  return (
    <>
      <section className="pb-12 pt-16 text-center md:pb-16 md:pt-24">
        <div className="wadah">
          <h1 className="judul-besar mx-auto max-w-3xl">
            Harga yang jelas,
            <br />
            tanpa kejutan.
          </h1>
          <p className="lead mx-auto mt-6 max-w-xl">
            Bayar dengan QRIS, tanpa akun dan tanpa perpanjangan tersembunyi.
            Semua kemampuan NaoVert tersedia pada kedua paket.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-tinta-2">
            {bukti.map((b) => (
              <span key={b.teks} className="inline-flex items-baseline gap-1.5">
                <b className="text-[15px] font-semibold tabular-nums text-tinta">{b.angka}</b>
                {b.teks}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="wadah pb-24">
        <div className="mx-auto grid max-w-4xl items-stretch gap-5 lg:grid-cols-2">
          {paket.map((item, i) => (
            <Muncul key={item.id} jeda={i * 60}>
              <KartuHarga item={item} />
            </Muncul>
          ))}
        </div>

        <section className="mx-auto mt-20 max-w-3xl">
          <div className="text-center">
            <p className="label">Pertanyaan umum</p>
            <h2 className="judul-bagian mt-3">Klarifikasi pembayaran &amp; lisensi.</h2>
          </div>
          <div className="mt-8 space-y-2.5">
            {tanya.map((q) => (
              <details key={q.t} className="group rounded-xl border border-garis px-5">
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 py-4">
                  <span className="flex-1 text-[14px] font-semibold tracking-[-0.01em]">{q.t}</span>
                  <span className="shrink-0 text-tinta-3 transition-transform group-open:rotate-180">
                    <Ikon nama="panah" ukuran={16} className="rotate-90" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-5 pr-8 text-[13.5px] leading-relaxed text-tinta-2">
                  {q.j}
                </p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-14 flex flex-wrap justify-center gap-3">
          <Link href="/harga/bayar" className="tombol">
            Bayar dengan QRIS
            <Ikon nama="panah" ukuran={16} />
          </Link>
          <Link href="/format" className="tombol tombol-garis">
            Lihat semua format
          </Link>
        </div>
      </div>
    </>
  );
}
