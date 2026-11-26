import { cn } from "@/lib/utils";
import LabelGaris from "@/components/label-garis";
import type { ReactNode } from "react";

/**
 * Kepala bagian.
 *
 * Susunannya selalu sama di seluruh situs: nomor, label kecil, judul besar,
 * lalu satu paragraf penjelas. Nomor dan label memberi tempat berpijak saat
 * orang menggulir cepat; judulnya yang dibaca kalau orang berhenti.
 */
export default function KepalaBagian({
  nomor,
  label,
  judul,
  penjelas,
  tengah = false,
  className,
}: {
  nomor?: string;
  label: string;
  judul: ReactNode;
  penjelas?: ReactNode;
  tengah?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", tengah && "mx-auto text-center", className)}>
      <div className={cn("flex items-center gap-3", tengah && "justify-center")}>
        {nomor && (
          <span className="font-mono text-[12px] font-semibold tracking-[0.08em] text-tinta-3">
            {nomor}
          </span>
        )}
        <LabelGaris>{label}</LabelGaris>
      </div>

      <h2 className="judul-bagian mt-4">{judul}</h2>

      {penjelas && (
        <p className={cn("lead mt-5", tengah && "mx-auto")}>{penjelas}</p>
      )}
    </div>
  );
}
