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
  // Configure static generation
  staticPageGenerationTimeout: 120,
}

module.exports = nextConfig
