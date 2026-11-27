import Muncul from "@/components/muncul";
import type { ReactNode } from "react";

/**
 * Kepala halaman dalam.
 *
 * Satu bentuk untuk semua halaman selain beranda, supaya perpindahan antar
 * halaman tidak terasa seperti masuk situs lain. Judulnya memakai ukuran yang
 * lebih kecil dari hero beranda: halaman ini dibuka dengan tujuan tertentu,
 * jadi tidak perlu menarik perhatian selama satu layar penuh.
 */
export default function KepalaHalaman({
  label,
  judul,
  penjelas,
  children,
}: {
  label: string;
  judul: ReactNode;
  penjelas?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="pt-14 pb-12 md:pt-20 md:pb-16">
      <div className="wadah">
        <Muncul className="mx-auto max-w-3xl text-center">
          <span className="chip mx-auto w-fit">{label}</span>
          <h1 className="judul-bagian mt-6">{judul}</h1>
          {penjelas && <p className="lead mx-auto mt-5">{penjelas}</p>}
          {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
        </Muncul>
      </div>
    </section>
  );
}
