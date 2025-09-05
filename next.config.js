/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false, // Disable for deployment
  eslint: {
    // Completely ignore ESLint during build
    ignoreDuringBuilds: true,
    dirs: [], // Don't run ESLint on any directories
  },
  typescript: {
    // Ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [],
  },
  // Disable telemetry
  telemetry: {
    enabled: false
  }
}

module.exports = nextConfig