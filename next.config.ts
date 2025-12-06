import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'server.kepket.uz',
      },
      {
        protocol: 'https',
        hostname: '*.kepket.uz',
      },
    ],
  },
};

export default nextConfig;
