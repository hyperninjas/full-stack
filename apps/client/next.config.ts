import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9001',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'prium.github.io',
        pathname: '/aurora/images/**',
      },
    ],
  },
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
};

export default nextConfig;
