import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import KepalaHalaman from "@/components/kepala-halaman";
import Muncul from "@/components/muncul";
import Ikon from "@/components/ikon";
import { fiturLisensi, paket, rupiah } from "@/lib/harga";
import { jumlahEkstensi, jumlahTujuan, namaMesin } from "@/lib/data";

const isi: Record<
  string,
  {
    judul: React.ReactNode;
    penjelas: string;
    untuk: string[];
    syarat: string[];
    tanya: { t: string; j: string }[];
  }
> = {
  bulanan: {
    judul: (
      <>
        Lisensi bulanan,
        <br />
        <span className="text-tinta-3">aktif tiga puluh hari.</span>
      </>
    ),
    penjelas:
      "Untuk pekerjaan jangka pendek: satu proyek, satu semester, atau satu berkas besar yang harus selesai minggu ini. Tidak ada perpanjangan otomatis.",
    untuk: [
      "Mengerjakan satu proyek yang selesai dalam hitungan minggu.",
      "Mencoba seluruh mesin sebelum memutuskan paket tahunan.",
      "Komputer bersama yang hanya sesekali dipakai untuk konversi.",
    ],
    syarat: [
      "Aktif 30 hari sejak lisensi diaktifkan, bukan sejak dibeli.",
      "Satu lisensi untuk satu komputer Windows.",
      "Semua kemampuan aplikasi terbuka, tanpa fitur yang dikunci.",
    ],
    tanya: [
      {
        t: "Apa yang terjadi setelah 30 hari?",
        j: "Aplikasi berhenti membuka berkas baru sampai lisensi diperpanjang. Berkas hasil konversi Anda tetap ada, tidak ada yang dihapus.",
      },
      {
        t: "Bisa pindah ke paket tahunan di tengah masa aktif?",
        j: "Bisa. Sisa masa aktif bulanan dihitung sebagai pengurang harga paket tahunan saat aktivasi.",
      },
    ],
  },
  tahunan: {
    judul: (
      <>
        Lisensi tahunan,
        <br />
        <span className="text-tinta-3">setara sepuluh bulan.</span>
      </>
    ),
    penjelas:
      "Untuk pemakaian sehari-hari. Harga promo Rp150.000 dari harga asli Rp180.000, jadi dua bulan tidak perlu dibayar.",
    untuk: [
      "Pemakaian rutin sepanjang tahun tanpa memikirkan perpanjangan.",
      "Tim kecil yang memakai konversi hampir setiap hari.",
      "Siapa pun yang sudah yakin aplikasi ini masuk ke alur kerjanya.",
    ],
    syarat: [
      "Aktif 365 hari sejak lisensi diaktifkan.",
      "Satu lisensi untuk satu komputer Windows.",
      "Harga promo berlaku sampai masa promosi berakhir.",
    ],
    tanya: [
      {
        t: "Apakah harga promo bisa berubah?",
        j: "Bisa. Harga promo ditinjau berkala. Selama masa aktif berjalan, harga yang sudah dibayar tidak berubah.",
      },
      {
        t: "Bagaimana perpanjangan tahunan?",
        j: "Perpanjangan tidak otomatis. Menjelang masa aktif habis, Anda menerima nomor pesanan lama sebagai rujukan untuk membeli perpanjangan.",
      },
    ],
  },
};

export function generateStaticParams() {
  return paket.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = paket.find((p) => p.id === id);
  if (!item) return { title: "Paket tidak ditemukan" };
  return {
    title: `Lisensi ${item.nama.toLowerCase()}`,
    description: `Lisensi NaoVert ${item.nama.toLowerCase()} ${rupiah.format(item.harga)} ${item.periode}. ${item.durasi}, tanpa perpanjangan otomatis.`,
  };
}

export default async function HalamanPaket({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = paket.find((p) => p.id === id);
  const detail = isi[id];
  if (!item || !detail) notFound();

  const hemat = item.hargaAsli - item.harga;

  return (
    <>
      <KepalaHalaman label={`Lisensi ${item.nama}`} judul={detail.judul} penjelas={detail.penjelas}>
        <Link href={`/harga/bayar?paket=${item.id}`} className="tombol">
          Bayar dengan QRIS
          <Ikon nama="panah" ukuran={16} />
        </Link>
        <Link href="/harga" className="tombol tombol-garis">
          Bandingkan paket
        </Link>
      </KepalaHalaman>

      <div className="wadah pb-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
          <Muncul>
            <div className="border-b border-garis pb-8">
              <p className="label">Harga</p>
              <p className="mt-3 flex flex-wrap items-baseline gap-2.5">
                <span className="text-[clamp(2.6rem,6vw,3.6rem)] font-semibold leading-none tracking-[-0.04em] tabular-nums">
                  {rupiah.format(item.harga)}
                </span>
                <span className="text-[14px] text-tinta-3">{item.periode}</span>
              </p>
              {hemat > 0 ? (
                <p className="mt-3 flex flex-wrap items-center gap-2.5 text-[13px] text-tinta-2">
                  <del className="tabular-nums text-tinta-3">{rupiah.format(item.hargaAsli)}</del>
                  <span className="rounded-full bg-timbul px-2.5 py-1 text-[12px] font-semibold">
                    Hemat {rupiah.format(hemat)}
                  </span>
                  <span className="text-tinta-3">harga promo, bukan harga tetap</span>
                </p>
              ) : (
                <p className="mt-3 text-[13px] text-tinta-2">Tanpa perpanjangan otomatis.</p>
              )}
            </div>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div>
                <p className="label">Cocok untuk</p>
                <ul className="mt-3 space-y-2.5">
                  {detail.untuk.map((u) => (
                    <li key={u} className="flex gap-2.5 text-[13.5px] leading-relaxed text-tinta-2">
                      <span className="mt-0.5 shrink-0 text-tinta-3">
                        <Ikon nama="panah" ukuran={14} />
                      </span>
                      {u}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="label">Ketentuan</p>
                <ul className="mt-3 space-y-2.5">
                  {detail.syarat.map((s) => (
                    <li key={s} className="flex gap-2.5 text-[13.5px] leading-relaxed text-tinta-2">
                      <span className="mt-0.5 shrink-0 text-tinta-3">
                        <Ikon nama="centang" ukuran={14} />
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 border-t border-garis pt-8">
              <p className="label">Isi lisensi</p>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {fiturLisensi.map((f) => (
                  <li key={f} className="flex gap-2.5 text-[13.5px] leading-relaxed text-tinta-2">
                    <span className="mt-0.5 shrink-0 text-tinta-3">
                      <Ikon nama="centang" ukuran={14} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 border-t border-garis pt-8">
              <p className="label">Pertanyaan tentang paket ini</p>
              <div className="mt-4 space-y-3">
                {detail.tanya.map((q) => (
                  <details key={q.t} className="group rounded-xl border border-garis px-4">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 py-3">
                      <span className="flex-1 text-[14px] font-semibold tracking-[-0.01em]">
                        {q.t}
                      </span>
                      <span className="shrink-0 text-tinta-3 transition-transform group-open:rotate-180">
                        <Ikon nama="panah" ukuran={15} className="rotate-90" />
                      </span>
                    </summary>
                    <p className="pb-4 pr-8 text-[13px] leading-relaxed text-tinta-2">{q.j}</p>
                  </details>
                ))}
              </div>
            </div>
          </Muncul>

          <Muncul className="self-start lg:sticky lg:top-24" jeda={80}>
            <div className="kartu p-6">
              <p className="text-[13px] font-semibold">Ringkasan</p>
              <dl className="mt-4 space-y-2.5 border-t border-garis pt-4 text-[13px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-tinta-2">Paket</dt>
                  <dd>Lisensi {item.nama}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-tinta-2">Masa aktif</dt>
                  <dd>{item.durasi.replace("Aktif ", "")}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-tinta-2">Komputer</dt>
                  <dd>1 perangkat</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-tinta-2">Pembayaran</dt>
                  <dd>QRIS</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-garis pt-3">
                  <dt className="font-semibold">Total</dt>
                  <dd className="text-[20px] font-semibold tabular-nums">
                    {rupiah.format(item.harga)}
                  </dd>
                </div>
              </dl>
              <Link href={`/harga/bayar?paket=${item.id}`} className="tombol mt-5 w-full">
                Lanjut ke pembayaran
              </Link>
              <p className="mt-3 text-[11.5px] leading-relaxed text-tinta-3">
                Kode QRIS dibuat khusus untuk nominal ini. Status lunas diperiksa
                otomatis setiap lima detik.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-garis p-5">
              <p className="text-[12px] font-semibold text-tinta-2">Yang ikut terpasang</p>
              <p className="mt-2 font-mono text-[11.5px] leading-relaxed text-tinta-3">
                {namaMesin.join(" · ")}
              </p>
              <p className="mt-2 text-[11.5px] leading-relaxed text-tinta-3">
                {jumlahEkstensi} jenis berkas · {jumlahTujuan} tujuan konversi
              </p>
            </div>
          </Muncul>
        </div>
      </div>
    </>
  );
}
