import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import KemajuanBaca from "@/components/kemajuan-baca";
import { situs } from "@/lib/data";
import "./globals.css";

/*
 * Dua huruf saja. Instrument Sans untuk seluruh teks: bentuknya netral tetapi
 * punya ketegasan di ujung huruf, dan tidak sedang dipakai semua orang seperti
 * huruf antar muka bawaan. JetBrains Mono hanya untuk angka dan label teknis,
 * karena angka harus sejajar rapi saat dibandingkan.
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
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#16181b" },
    { media: "(prefers-color-scheme: light)", color: "#f2efe9" },
  ],
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
 * Skrip tema. Dijalankan sebelum halaman dilukis supaya pilihan terang tidak
 * berkedip menjadi gelap lebih dulu. Isinya dibaca dari localStorage, dengan
 * cadangan pada pengaturan sistem.
 */
const skripTema = `(function(){try{var t=localStorage.getItem("naovert-tema");if(!t){t=window.matchMedia("(prefers-color-scheme: light)").matches?"terang":"gelap"}if(t==="terang"){document.documentElement.dataset.tema="terang"}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${aksi.variable} ${angka.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: skripTema }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a
          href="#utama"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-tinta focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-latar"
        >
          Lompat ke isi utama
        </a>
        <KemajuanBaca />
        <Header />
        <main id="utama">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
