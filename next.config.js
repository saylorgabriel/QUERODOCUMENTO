/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  eslint: {
    // Ignore ESLint errors during build on Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during build on Vercel
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [],
  },
}

module.exports = nextConfig