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

            // 启用SWC压缩以获得更快的构建
          // swcMinify: true, // Commented out due to Next.js version compatibility

  // 启用压缩
  compress: true,

  // 优化图像
  images: {
    domains: ['localhost'],
    unoptimized: false,
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
          '**/temp/**', // Add this to ignore temp files
        ],
        aggregateTimeout: 500, // Increase timeout to reduce rebuilds
        poll: 2000, // Increase poll interval
      }
      config.resolve.symlinks = false

      // 开发模式优化 - 完全禁用vendors chunk以避免语法错误
      config.optimization = {
        ...config.optimization,
        splitChunks: false, // 完全禁用代码分割以避免vendors.js错误
      }
    }

    return config
  },
            experimental: {
            // 启用Turbo
            turbo: {
              rules: {},
            },
          },
  async rewrites() {
    return [
      {
        source: '/console/api/:path*',
        destination: 'http://localhost:5001/console/api/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
      {
        source: '/files/:path*',
        destination: 'http://localhost:5001/files/:path*',
      },
    ]
  },
  async redirects() {
    return [
      // 移除 /console 重定向，因为我们已经创建了 /console 页面
      // {
      //   source: '/console',
      //   destination: '/apps',
      //   permanent: false,
      // },
    ]
  },
}

module.exports = withMDX(nextConfig)
