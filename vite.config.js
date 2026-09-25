import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['sprout.svg', 'favicon.ico'],
      manifest: {
        name: 'KrishiSetu AI',
        short_name: 'KrishiSetu',
        description: 'Offline-first AI plant pathologist for Indian farming communities',
        theme_color: '#f4f4f5',
        background_color: '#f4f4f5',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'sprout.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'sprout.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // The .bin weight shard is precached deliberately. Workbox's precache
        // is the only cache that can serve something the device has never
        // fetched: runtime caching fills up on demand, so a fresh install that
        // has not run a scan yet would still be offline-broken. Without this the
        // precache has model.json but not the weights, tf.loadLayersModel dies
        // part-way through the load, and a device that skipped Settings ->
        // Download can never scan offline. ~1.75 MB, which is the whole point
        // of an offline-first app. OPFS stays the primary copy; this is the
        // bootstrap for a device that has not installed one yet.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,bin}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'google-maps-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true
  }
});
