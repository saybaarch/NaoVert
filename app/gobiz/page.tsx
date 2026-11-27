import type { Metadata } from "next";
import KepalaHalaman from "@/components/kepala-halaman";
import GobizLocal from "@/components/gobiz-local";

export const metadata: Metadata = {
  title: "Panel admin pembayaran",
  description: "Panel lokal untuk konfigurasi GoBiz, koneksi merchant, harga produk, dan uji QRIS.",
  robots: { index: false, follow: false },
};

export default function HalamanGobizLokal() {
  return (
    <>
      <KepalaHalaman
        label="Panel admin"
        judul={
          <>
            Pembayaran GoBiz,
            <br />
            <span className="text-tinta-3">dalam satu panel.</span>
          </>
        }
        penjelas="Periksa konfigurasi API, hubungkan merchant melalui OTP, lihat harga produk, dan uji QRIS tanpa membocorkan token."
      >
        <div className="flex flex-wrap gap-3">
          <a className="tombol" href="/gobiz/qris">
            Uji QRIS dinamis Rp1.000
          </a>
          <a className="tombol tombol-garis" href="/harga">
            Lihat harga publik
          </a>
        </div>
      </KepalaHalaman>
      <div className="wadah pb-24">
        <GobizLocal />
      </div>
    </>
  );
}
