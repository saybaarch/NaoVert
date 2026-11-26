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
 * Dua batang membentuk V, bertemu di satu titik. Batang kiri lebih tipis dan
 * lebih pendek dari batang kanan, sehingga bentuknya terbaca sebagai tanda
 * buatan, bukan sebagai huruf V dari sebuah typeface. Di titik temunya ada
 * satu simpul tembaga: itu satu-satunya warna di dalam tanda, dan itu pula
 * yang membuat logo ini dikenali meski dicetak satu warna pada ukuran kecil.
 *
 * Warna memakai `currentColor` supaya tanda ikut warna teks di sekitarnya,
 * kecuali simpul yang tetap tembaga.
 */
export function Tanda({
  ukuran = 28,
  simpul = true,
  ...sisa
}: { ukuran?: number; simpul?: boolean } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={ukuran}
      height={ukuran}
      fill="currentColor"
      aria-hidden="true"
      {...sisa}
    >
      {/* Batang kiri: tipis, mulai lebih rendah, berhenti di simpul. */}
      <rect
        x="-1.9"
        y="0"
        width="3.8"
        height="21.87"
        transform="translate(5.9 6.2) rotate(62.5)"
      />
      {/* Batang kanan: lebih tebal, turun lebih dalam. */}
      <rect
        x="-2.55"
        y="0"
        width="5.1"
        height="22.76"
        transform="translate(26.1 5.2) rotate(116.34)"
      />
      {/* Simpul tembaga di titik temu. */}
      <circle cx="16" cy="25.6" r="3" fill="var(--tembaga)" style={simpul ? undefined : { display: "none" }} />
    </svg>
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
