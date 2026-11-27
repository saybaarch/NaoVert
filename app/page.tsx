import Hero from "@/components/hero";
import PitaAngka from "@/components/pita-angka";
import BagianManfaat from "@/components/bagian-manfaat";
import BagianHarga from "@/components/bagian-harga";
import BagianPrivasi from "@/components/bagian-privasi";
import BagianInspirasi from "@/components/bagian-inspirasi";
import BagianPenutup from "@/components/bagian-penutup";

/**
 * Beranda.
 *
 * Urutannya mengikuti acuan ikhtisar: pengantar dan panggung aplikasi yang
 * dipin (satu komponen, scroll menerus), deretan angka, manfaat yang bisa
 * digeser, harga ringkas, keamanan, inspirasi, lalu penutup. Isi yang lebih
 * dalam tinggal di halaman Fitur, Format, Panduan, dan Harga.
 */
export default function Beranda() {
  return (
    <>
      <Hero />
      <PitaAngka />
      <BagianManfaat />
      <BagianHarga />
      <BagianPrivasi />
      <BagianInspirasi />
      <BagianPenutup />
    </>
  );
}
