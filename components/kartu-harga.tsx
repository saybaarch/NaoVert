import Link from "next/link";
import Ikon from "@/components/ikon";
import { fiturLisensi, paket, rupiah } from "@/lib/harga";

type PaketHarga = (typeof paket)[number];

/**
 * Kartu paket.
 *
 * CTA-nya menuju halaman detail paket, bukan langsung kasir, supaya orang
 * sempat membaca isi lisensi sebelum membayar. Tanpa badge melayang dan tanpa
 * latar berwarna: pembeda paket unggulan hanya garis tepi yang lebih tegas.
 */
export default function KartuHarga({
  item,
  ringkas = false,
}: {
  item: PaketHarga;
  ringkas?: boolean;
}) {
  const hemat = item.hargaAsli - item.harga;

  return (
    <article
      className={`flex h-full flex-col rounded-2xl border bg-panel p-7 ${
        item.unggulan ? "border-tinta/40 shadow-[var(--bayang-timbul)]" : "border-garis"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[17px] font-semibold tracking-[-0.02em]">{item.nama}</h2>
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-tinta-3">
          {item.durasi}
        </span>
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-tinta-2">
        {item.unggulan
          ? "Setara sepuluh bulan, berlaku penuh satu tahun."
          : "Untuk kebutuhan jangka pendek, aktif 30 hari."}
      </p>

      <div className="mt-6 border-b border-garis pb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-[clamp(2.1rem,4.2vw,2.7rem)] font-semibold leading-none tracking-[-0.04em] tabular-nums">
            {rupiah.format(item.harga)}
          </span>
          <span className="text-[13px] text-tinta-3">{item.periode}</span>
        </div>
        {hemat > 0 ? (
          <p className="mt-2.5 flex flex-wrap items-center gap-2 text-[12.5px]">
            <del className="text-tinta-3 tabular-nums">{rupiah.format(item.hargaAsli)}</del>
            <span className="rounded-full bg-timbul px-2.5 py-1 font-semibold text-tinta-2">
              Hemat {rupiah.format(hemat)}
            </span>
          </p>
        ) : (
          <p className="mt-2.5 text-[12.5px] text-tinta-3">Tanpa perpanjangan otomatis.</p>
        )}
      </div>

      <ul className="mt-6 space-y-2.5">
        {fiturLisensi.map((fitur) => (
          <li key={fitur} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-tinta-2">
            <span className="mt-0.5 shrink-0 text-tinta-3">
              <Ikon nama="centang" ukuran={15} />
            </span>
            {fitur}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        <Link href={`/harga/${item.id}`} className={`tombol w-full ${item.unggulan ? "" : "tombol-garis"}`}>
          {ringkas ? "Lihat detail paket" : "Pilih paket ini"}
          <Ikon nama="panah" ukuran={16} />
        </Link>
      </div>
    </article>
  );
}
