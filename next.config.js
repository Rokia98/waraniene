const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: '/~offline',
  },
  runtimeCaching: [
    // Catalogue produits (public) – NetworkFirst, cache 5 min
    {
      urlPattern: /^\/api\/produits.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-produits',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 },
      },
    },
    // Artisans publics – NetworkFirst, cache 10 min
    {
      urlPattern: /^\/api\/artisans.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-artisans',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 30, maxAgeSeconds: 10 * 60 },
      },
    },
    // Images Supabase Storage – CacheFirst, 30 jours
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-images',
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    // Images locales /public/images – CacheFirst, 7 jours
    {
      urlPattern: /\/images\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'local-images',
        expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    // Polices Google – CacheFirst, 1 an
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = withPWA(nextConfig)