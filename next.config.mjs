/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb', // Kita set ke 4MB agar sinkron dengan kode portfolio.js
    },
  },
  /* config options here */
};

export default nextConfig;
