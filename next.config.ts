import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https' as const, hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https' as const, hostname: 'raw.githubusercontent.com' },
      { protocol: 'https' as const, hostname: 'res.cloudinary.com' },
      { protocol: 'https' as const, hostname: 'ik.imagekit.io' },
    ],
  },
  // Security headers are applied in proxy.ts
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
