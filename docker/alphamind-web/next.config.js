/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://alphamind-api-1:5001',
    NEXT_PUBLIC_DIFY_API_URL: process.env.NEXT_PUBLIC_DIFY_API_URL || 'http://alphamind-api-1:5001',
  },
  webpack: (config, { dev, isServer }) => {
    // 解决 Windows 路径大小写问题
    if (dev && !isServer) {
      config.watchOptions = {
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: 1000,
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
        source: '/api/alphamind/:path*',
        destination: 'http://alphamind-api-1:5001/api/:path*',
      },
      {
        source: '/console/api/:path*',
        destination: 'http://alphamind-api-1:5001/console/api/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://alphamind-api-1:5001/api/:path*',
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

