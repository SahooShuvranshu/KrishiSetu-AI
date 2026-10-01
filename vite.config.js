import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.png', 'apple-touch-icon.png', 'logo.svg', 'sprout.svg', 'og-image.jpg'],
      manifest: {
        name: 'KrishiSetu AI - Offline Crop Doctor & Advisory',
        short_name: 'KrishiSetu AI',
        description: '100% Offline AI plant pathologist & agricultural advisory for Indian farming communities',
        theme_color: '#CCFF00',
        background_color: '#f4f4f5',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo.svg',
            sizes: 'any',
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
        // Download can never scan offline. ~4.6 MB across two shards (the
        // alpha=1.0 model), which is the whole point of an offline-first app.
        // maximumFileSizeToCacheInBytes is raised above workbox's 2 MiB
        // default because the largest shard is ~4.2 MB. OPFS stays the
        // primary copy; this is the bootstrap for a device that has not
        // installed one yet.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,bin}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
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
