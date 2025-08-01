/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://api:5001',
    NEXT_PUBLIC_DIFY_API_URL: process.env.NEXT_PUBLIC_DIFY_API_URL || 'http://api:5001',
  },
  webpack: (config, { dev, isServer }) => {
    // 解决 Windows 路径大小写问题
    if (dev && !isServer) {
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/temp/**',
          '**/docs/**',
          '**/docker/**',
          '**/scripts/**',
          '**/tests/**',
          '**/sdks/**',
          '**/images/**',
          '**/backup.sql',
          '**/.env*',
          '**/*.md',
          '**/*.txt',
          '**/*.log',
        ],
        aggregateTimeout: 500,
        poll: 2000,
      }
      config.resolve.symlinks = false
    }

    return config
  },
  experimental: {
    // 禁用文件系统缓存避免路径问题
    turbo: {
      rules: {},
    },
  },
  async rewrites() {
    return [
      {
        source: '/console/api/:path*',
        destination: 'http://api:5001/console/api/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://api:5001/api/:path*',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/console',
        destination: '/apps',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
