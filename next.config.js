const withPWA = require('next-pwa')({
  dest: 'public',
  // Disable service worker in development to avoid cache confusion
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  // Re-fetch the SW on every navigation so updates are picked up promptly
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  // Don't try to precache Next.js error pages (avoids stale error caches)
  buildExcludes: [/middleware-manifest\.json$/, /chunks\/pages\/_error.*\.js$/],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Recommended security headers (also set in vercel.json for static assets)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',         value: 'DENY' },
          { key: 'X-XSS-Protection',        value: '1; mode=block' },
          { key: 'Referrer-Policy',         value: 'origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

module.exports = withPWA(nextConfig)
