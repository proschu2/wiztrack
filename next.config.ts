import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['mediateca.lamb-burbot.ts.net'],
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;