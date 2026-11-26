/** @type {import('next').NextConfig} */
const nextConfig = {
  // Gambar disajikan apa adanya. Tangkapan layar aplikasi sudah berukuran
  // pas, jadi tidak perlu pengoptimalan yang menambah ketergantungan.
  images: {
    unoptimized: true,
  },

  // Alamat lama situs statis diarahkan ke alamat baru, supaya tautan yang
  // sudah tersebar tidak berakhir di halaman kosong.
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/format.html', destination: '/format', permanent: true },
      { source: '/panduan.html', destination: '/panduan', permanent: true },
      { source: '/tentang.html', destination: '/tentang', permanent: true },
      { source: '/unduh.html', destination: '/unduh', permanent: true },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },

}

export default nextConfig
