import Hero from "@/components/hero";
import PitaAngka from "@/components/pita-angka";
import PitaFormat from "@/components/pita-format";
import BagianBab from "@/components/bagian-bab";
import BagianVideo from "@/components/bagian-video";
import BagianKategori from "@/components/bagian-kategori";
import BagianCara from "@/components/bagian-cara";
import BagianKlikKanan from "@/components/bagian-klik-kanan";
import BagianGaleri from "@/components/bagian-galeri";
import BagianPenutup from "@/components/bagian-penutup";

/**
 * Beranda.
 *
 * Urutannya sengaja seperti alur membaca: apa ini, seberapa luas, seperti apa
 * kerjanya, lalu di mana mengunduhnya. Bagian yang paling akhir justru yang
 * paling penting bagi orang yang sudah yakin.
 */
export default function Beranda() {
  return (
    <>
      <Hero />
      <PitaAngka />
      <PitaFormat />
      <BagianBab />
      <BagianVideo />
      <BagianKategori />
      <BagianCara />
      <BagianKlikKanan />
      <BagianGaleri />
      <BagianPenutup />
    </>
  );
}
