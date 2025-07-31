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
  // WSL環境でのホットリロード対応
  watchOptions: {
    poll: 1000,
    aggregateTimeout: 300,
  },
}

module.exports = nextConfig