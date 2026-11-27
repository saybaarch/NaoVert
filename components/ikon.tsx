import type { NamaIkon } from "@/lib/data";
import type { SVGProps } from "react";

/**
 * Ikon garis. Satu ketebalan, satu gaya, tanpa isi berwarna.
 *
 * Semua ikon digambar dengan `stroke` saja supaya seragam dengan teks di
 * sebelahnya dan tidak menarik perhatian lebih dari judulnya.
 */
const jalur: Record<NamaIkon | "unduh" | "panah" | "centang" | "putar" | "tutup" | "menu" | "matahari" | "bulan" | "main", string[]> = {
  perisai: ["M12 3 5 6v6c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6z", "m9 12 2 2 4-4"],
  mesin: [
    "M12 3v3M12 18v3M3 12h3M18 12h3",
    "M5.6 5.6 7.8 7.8M16.2 16.2l2.2 2.2M18.4 5.6 16.2 7.8M7.8 16.2 5.6 18.4",
    "M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5",
  ],
  timbangan: ["M12 4v16", "M5 8h14", "M8 8l-3 5h6z", "M16 8l-3 5h6z", "M8 20h8"],
  dokumen: ["M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z", "M14 3v4h4", "M9 12h6M9 16h4"],
  lipat: ["M4 6h16", "M4 12h10", "M4 18h13"],
  lapis: ["M12 3 3 8l9 5 9-5z", "m3 13 9 5 9-5", "m3 17.5 9 5 9-5"],
  unduh: ["M12 3v12", "m7 11 5 5 5-5", "M4 20h16"],
  panah: ["M5 12h13", "m12 5 7 7-7 7"],
  centang: ["m4 12.5 5 5L20 6.5"],
  putar: ["M12 3a9 9 0 1 0 9 9", "M21 3v6h-6"],
  tutup: ["M6 6l12 12", "M18 6 6 18"],
  menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
  matahari: [
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
    "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  ],
  bulan: ["M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"],
  main: ["M8 5.5v13l11-6.5z"],
};

export default function Ikon({
  nama,
  ukuran = 20,
  ...sisa
}: { nama: keyof typeof jalur; ukuran?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={ukuran}
      height={ukuran}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...sisa}
    >
      {jalur[nama].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/**
 * Tanda NaoVert.
 *
 * Ini BUKAN tanda yang digambar ulang. Ini berkas logo asli aplikasi
 * (NaoVert/assets/logo-256.png dan logo-light-256.png) yang disalin apa
 * adanya ke public/img, jadi logo situs dan logo aplikasi adalah berkas yang
 * sama, bukan dua gambar yang mirip. Sudut membulatnya 19,5 persen, diukur
 * dari lengkung sudut berkas aslinya.
 *
 * Dua berkas dipakai karena logo punya versi gelap dan terang: versinya mana
 * yang tampil ditentukan tema lewat CSS, tanpa JavaScript.
 */
export function Tanda({
  ukuran = 28,
  ...sisa
}: { ukuran?: number } & SVGProps<HTMLImageElement>) {
  return (
    <>
      <img
        src="/img/logo-asli.png"
        width={ukuran}
        height={ukuran}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="tanda-logo tanda-gelap"
        {...sisa}
      />
      <img
        src="/img/logo-asli-terang.png"
        width={ukuran}
        height={ukuran}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="tanda-logo tanda-terang"
        {...sisa}
      />
    </>
  );
}

/**
 * Tanda di dalam kotak bergaris.
 *
 * Dipakai di tempat yang butuh penanda kecil tanpa teks, misalnya butir daftar.
 * Kotaknya tipis supaya tidak bersaing dengan isi di sebelahnya.
 */
export function TandaKotak({ ukuran = 30 }: { ukuran?: number }) {
  return (
    <span
      className="grid place-items-center border border-garis-2 text-tinta"
      style={{ width: ukuran, height: ukuran, borderRadius: 6 }}
    >
      <Tanda ukuran={ukuran * 0.62} />
    </span>
  );
}
