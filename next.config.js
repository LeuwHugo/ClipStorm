/** @type {import('next').NextConfig} */
const nextConfig = {
  // Completely remove any static export configuration
  
  webpack: (config, { isServer }) => {
    // Fix for undici module parsing error
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Exclude problematic Node-only modules from client bundle
    config.externals = config.externals || [];
    config.externals.push({
      undici: "undici",
      "node:crypto": "crypto",
      "node:fs": "fs",
      "node:path": "path",
    });

    return config;
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;