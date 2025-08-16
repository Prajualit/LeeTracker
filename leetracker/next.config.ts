import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standard Next.js configuration for web application
  experimental: {
    optimizePackageImports: ['lucide-react'],
  }
};

export default nextConfig;
