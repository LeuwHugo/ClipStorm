/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cbscoropxgydvrsqsxnr.supabase.co'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['bufferutil', 'utf-8-validate']
  }
};

module.exports = nextConfig;