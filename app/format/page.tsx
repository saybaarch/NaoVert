import type { Metadata } from "next";
import KepalaHalaman from "@/components/kepala-halaman";
import PencariFormat from "@/components/pencari-format";
import { jumlahEkstensi, jumlahTujuan } from "@/lib/data";

export const metadata: Metadata = {
  title: "Daftar format",
  description:
    "Semua kategori format yang bisa dibaca dan dihasilkan NaoVert, dengan pencarian per nama format.",
};

export default function HalamanFormat() {
  return (
    <>
      <KepalaHalaman
        label="Daftar format"
        judul={
          <>
            Cari berkas Anda,
            <br />
            <span className="text-tinta-3">lihat tujuannya.</span>
          </>
        }
        penjelas={`${jumlahEkstensi} jenis berkas dikenali dan ${jumlahTujuan} tujuan konversi. Ketik nama format untuk menyaring, atau buka satu kategori untuk melihat seluruh daftarnya.`}
      />

      <div className="wadah pb-24">
        <PencariFormat />
      </div>
    </>
  );
}
