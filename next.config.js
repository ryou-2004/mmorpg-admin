/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*',
      },
    ]
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // WSL環境での最適化
      config.watchOptions = {
        ignored: /node_modules/,
        poll: 1000,
        aggregateTimeout: 300,
      }
      // ファイルシステムキャッシュを無効化
      config.cache = false
    }
    return config
  },
}

module.exports = nextConfig