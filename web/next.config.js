/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {},
})

const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
    NEXT_PUBLIC_DIFY_API_URL: process.env.NEXT_PUBLIC_DIFY_API_URL || 'http://localhost:5001',
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
        destination: 'http://localhost:5100/api/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
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

module.exports = withMDX(nextConfig)
