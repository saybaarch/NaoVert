import type { Metadata } from "next";
import KepalaHalaman from "@/components/kepala-halaman";
import QrisUji from "@/components/qris-uji";

export const metadata: Metadata = {
  title: "Uji QRIS dinamis",
  description: "Uji lokal QRIS dinamis Rp1.000 untuk merchant GoPay yang terhubung.",
  robots: { index: false, follow: false },
};

export default function HalamanQrisUji() {
  return (
    <>
      <KepalaHalaman
        label="Uji pembayaran lokal"
        judul={
          <>
            QRIS dinamis
            <br />
            <span className="text-tinta-3">Rp1.000.</span>
          </>
        }
        penjelas="Pindai kode, bayar Rp1.000, lalu tunggu status merchant berubah menjadi lunas."
      />
      <div className="wadah pb-24">
        <QrisUji />
      </div>
    </>
  );
}
