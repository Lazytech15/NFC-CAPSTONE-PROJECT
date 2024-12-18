// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',  // Changed to src directory
      filename: 'service worker.js',  // Changed back to sw.js
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'TapTrack Pro',
        short_name: 'TapTrack',
        description: 'Streamline Attendance and Event Management with Real-Time Alerts',
        theme_color: '#010066',
        background_color: '#010066',
        display: 'standalone',
        scope: '/NFC-CAPSTONE-PROJECT/',
        start_url: '/NFC-CAPSTONE-PROJECT/',
        icons: [
          {
            src: '/NFC-CAPSTONE-PROJECT/icons/icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/NFC-CAPSTONE-PROJECT/icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/NFC-CAPSTONE-PROJECT/icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        sourcemap: true
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  base: '/NFC-CAPSTONE-PROJECT/'
})