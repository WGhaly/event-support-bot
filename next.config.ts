import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Hydration-safe configurations
  experimental: {
    optimizePackageImports: ['react-konva', 'konva'],
  },
  
  // Exclude native modules from webpack bundling
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't include native modules or konva's Node.js version in the client bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        '@napi-rs/canvas': false,
        'canvas': false,
        'konva/lib/index-node': false,
      };
      // Ensure konva uses the browser version
      config.resolve.mainFields = ['browser', 'module', 'main'];
    } else {
      // On the server, exclude konva entirely since it's a client-only library
      config.externals.push({
        '@napi-rs/canvas': 'commonjs @napi-rs/canvas',
        'canvas': 'commonjs canvas',
        'konva': 'commonjs konva',
      });
    }
    return config;
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blob.vercel-storage.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Performance
  compress: true,
  poweredByHeader: false,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ]
  },
}

export default nextConfig
