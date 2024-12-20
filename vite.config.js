// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public', 
      filename: 'firebase-messaging-sw.js',  
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'TapTrack Pro',
        short_name: 'TapTrack',
        description: 'Streamline Attendance and Event Management with Real-Time Alerts',
        theme_color: '#010066',
        background_color: '#010066',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/icons/icon.svg',
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
  base: '/',
  build: {
    rollupOptions: {
      plugins: [
        {
          name: 'firebase-path-replace',
          transform(code) {
            // Replace the Firebase paths in the built files
            return {
              code: code
                .replace(/["']\/firebase-messaging-sw\.js["']/g, '"/firebase-messaging-sw.js"')
                .replace(/["']\/firebase-cloud-messaging-push-scope["']/g, '"/firebase-cloud-messaging-push-scope"')
            };
          }
        }
      ]
    }
  }
})