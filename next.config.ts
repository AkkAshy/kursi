import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kursi.erp-imaster.uz',
      },
      {
        protocol: 'https',
        hostname: '*.kursi.uz',
      },
    ],
  },
};

export default nextConfig;
