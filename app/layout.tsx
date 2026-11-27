import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { situs } from "@/lib/data";
import "./globals.css";

const aksi = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-aksi",
  display: "swap",
});

const angka = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-angka",
  display: "swap",
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#1b1d20",
};

export const metadata: Metadata = {
  metadataBase: new URL(situs.url),
  title: {
    default: `${situs.nama}, konverter berkas untuk Windows`,
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
      { url: "/img/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/img/favicon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/img/favicon.ico", sizes: "any" },
    ],
    apple: "/img/icon-192.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: situs.url,
    siteName: situs.nama,
    title: `${situs.nama}, konverter berkas untuk Windows`,
    description: situs.keterangan,
    images: [{ url: "/img/bagikan.png", width: 1200, height: 630, alt: situs.nama }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${situs.nama}, konverter berkas untuk Windows`,
    description: situs.keterangan,
    images: ["/img/bagikan.png"],
  },
  robots: { index: true, follow: true },
};

/*
 * Situs memakai satu tema gelap. Skrip tema dan tombol ganti tema sudah
 * dihapus; pilihan gelap dipatok lewat atribut data-tema di elemen html.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      data-tema="gelap"
      className={`${aksi.variable} ${angka.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">
        <a
          href="#utama"
          className="lompat-isi sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-tinta focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-latar"
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