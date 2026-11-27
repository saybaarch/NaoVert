export const HARGA_BULANAN = 15_000;

export const paket = [
  {
    id: "bulanan",
    nama: "Bulanan",
    harga: HARGA_BULANAN,
    hargaAsli: HARGA_BULANAN,
    periode: "/ bulan",
    durasi: "Aktif 30 hari",
    unggulan: false,
    badge: "Fleksibel",
  },
  {
    id: "tahunan",
    nama: "Tahunan",
    harga: 150_000,
    hargaAsli: HARGA_BULANAN * 12,
    periode: "/ tahun",
    durasi: "Aktif 365 hari",
    unggulan: true,
    badge: "Paling hemat",
  },
] as const;

export const fiturLisensi = [
  "Seluruh 13 kategori format",
  "150 tujuan konversi",
  "10 mesin konversi siap pakai",
  "Konversi lokal tanpa unggahan",
  "Tanpa batas jumlah berkas",
] as const;

export const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
