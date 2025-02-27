import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['ar.rdcpix.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Customize device sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Customize image sizes
  },
};

export default nextConfig;
