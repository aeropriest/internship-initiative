/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Add this to handle dynamic API routes
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Specify which routes should be dynamic
  output: 'standalone',
  // Disable static generation timeout to prevent long builds
  staticPageGenerationTimeout: 30,
  // Force dynamic rendering for API-heavy pages
  trailingSlash: false,
  // Disable static generation completely to prevent build-time API calls
  swcMinify: true,
  // Force all pages to be dynamic
  generateEtags: false,
}

module.exports = nextConfig
