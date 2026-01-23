import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin'],
  turbopack: {
    // Empty config to acknowledge Turbopack usage
  },
};

export default nextConfig;
