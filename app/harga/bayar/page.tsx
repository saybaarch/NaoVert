import type { Metadata } from "next";
import Link from "next/link";
import KepalaHalaman from "@/components/kepala-halaman";
import KasirPesanan from "@/components/kasir-pesanan";
import Muncul from "@/components/muncul";
import Ikon from "@/components/ikon";
import { paket, rupiah } from "@/lib/harga";

export const metadata: Metadata = {
  title: "Pembayaran QRIS",
  description:
    "Bayar lisensi NaoVert dengan QRIS. Nominal unik, kode 30 menit, status lunas diperiksa otomatis.",
};

const alur = [
  {
    nomor: "01",
    judul: "Pilih paket",
    isi: "Bulanan Rp15.000 atau tahunan promo Rp150.000. Semua kemampuan aplikasi terbuka di kedua paket.",
  },
  {
    nomor: "02",
    judul: "Pindai kode QRIS",
    isi: "Nominal sudah terkunci di dalam kode, termasuk kode unik kecil untuk mencocokkan pembayaran Anda.",
  },
  {
    nomor: "03",
    judul: "Tunggu status lunas",
    isi: "Halaman memeriksa riwayat merchant setiap lima detik. Tidak ada unggahan bukti transfer.",
  },
  {
    nomor: "04",
    judul: "Simpan nomor pesanan",
    isi: "Nomor pesanan menjadi bukti pembelian dan dasar pembuatan lisensi. Berlaku 30 menit.",
  },
];

export default async function HalamanBayar({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string }>;
}) {
  const { paket: awal } = await searchParams;
  const terpilih = paket.find((p) => p.id === awal);

  return (
    <>
      <KepalaHalaman
        label="Pembayaran"
        judul={
          <>
            QRIS, langsung
            <br />
            <span className="text-tinta-3">dari kasir.</span>
          </>
        }
        penjelas={
          terpilih
            ? `Paket ${terpilih.nama} ${rupiah.format(terpilih.harga)} ${terpilih.periode} sudah dipilih. Lanjutkan dengan memindai kode di bawah.`
            : "Pilih paket, lalu pindai kode QRIS. Kode dibuat untuk nominal paket itu, jadi tidak ada jumlah yang perlu diketik."
        }
      />

      <div className="wadah pb-24">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <Muncul>
            <KasirPesanan awal={awal} tetap={Boolean(terpilih)} />
          </Muncul>

          <Muncul jeda={80}>
            <div className="rounded-2xl border border-garis p-6">
              <p className="label">Cara bayarnya</p>
              <ol className="mt-5 space-y-5">
                {alur.map((a) => (
                  <li key={a.nomor} className="flex gap-4">
                    <span className="w-5 shrink-0 pt-0.5 font-mono text-[11px] text-tinta-3">
                      {a.nomor}
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold tracking-[-0.01em]">{a.judul}</p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-tinta-2">{a.isi}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4 rounded-2xl border border-garis p-6">
              <p className="text-[13px] font-semibold">Sebelum membayar</p>
              <ul className="mt-3 space-y-2.5">
                {[
                  "Cocokkan nama merchant: SAYBA ARC - GOPAY.",
                  "Nominal akhir bisa berbeda beberapa rupiah dari harga paket karena kode unik.",
                  "Jangan tutup halaman ini selama kode masih berlaku.",
                  "Pembayaran lebih dari nominal tidak otomatis cocok; hubungi pembuat bila terjadi.",
                ].map((b) => (
                  <li key={b} className="flex gap-2.5 text-[12.5px] leading-relaxed text-tinta-2">
                    <span className="mt-0.5 shrink-0 text-tinta-3">
                      <Ikon nama="perisai" ukuran={14} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-2xl border border-garis p-6">
              <p className="text-[13px] font-semibold">Setelah lunas</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-tinta-2">
                Simpan nomor pesanan dan alamat email yang Anda isi. Lisensi
                dibuat dari keduanya. Kalau status tidak berubah padahal sudah
                membayar, kirim nomor pesanan ke pembuat aplikasi.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/harga" className="tombol tombol-garis">
                  Bandingkan paket
                </Link>
                <Link href="/panduan" className="tombol tombol-garis">
                  Baca panduan
                </Link>
              </div>
            </div>
          </Muncul>
        </div>
      </div>
    </>
  );
}
