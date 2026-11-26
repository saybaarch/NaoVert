import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { situs } from "@/lib/data";
import "./globals.css";

/*
 * Satu keluarga huruf untuk semua teks, ditambah satu huruf berspasi tetap
 * untuk angka dan label teknis. Dua berkas saja, dan keduanya disajikan
 * sendiri oleh server, tanpa permintaan ke layanan luar saat halaman dibuka.
 */
const aksi = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-aksi",
  display: "swap",
});

const angka = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-angka",
  display: "swap",
  weight: ["400", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#04050a",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(situs.url),
  title: {
    default: `${situs.nama}, konverter berkas multi-format untuk Windows`,
    template: `%s | ${situs.nama}`,
  },
  description: situs.keterangan,
  applicationName: situs.nama,
  authors: [{ name: situs.pembuat, url: situs.pembuatUrl }],
  keywords: [
    "konverter berkas",
    "konversi format",
    "konverter dokumen Windows",
    "konverter gambar",
    "konverter video",
    "PDF ke Word",
    "NaoVert",
    "Sayba Arc",
  ],
  icons: {
    icon: [
      { url: "/img/favicon.ico", sizes: "48x48" },
      { url: "/img/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/img/icon-512.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: situs.url,
    siteName: situs.nama,
    title: `${situs.nama}, konverter berkas multi-format untuk Windows`,
    description: situs.keterangan,
    images: [{ url: "/img/icon-1024.png", width: 1024, height: 1024, alt: situs.nama }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${situs.nama}, konverter berkas multi-format untuk Windows`,
    description: situs.keterangan,
    images: ["/img/icon-1024.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${aksi.variable} ${angka.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#utama"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-kertas focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
        >
          Lompat ke isi utama
        </a>
        <Header />
        <main id="utama">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
