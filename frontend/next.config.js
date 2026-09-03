/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  },
  // Set the correct workspace root to avoid lockfile warnings
  outputFileTracingRoot: './',
}

module.exports = nextConfig