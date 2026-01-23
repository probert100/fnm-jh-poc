import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize firebase-admin to prevent bundling issues
      config.externals = config.externals || [];
      config.externals.push({
        'firebase-admin': 'commonjs firebase-admin',
        'firebase-admin/app': 'commonjs firebase-admin/app',
        'firebase-admin/database': 'commonjs firebase-admin/database',
      });
    }
    return config;
  },
};

export default nextConfig;
