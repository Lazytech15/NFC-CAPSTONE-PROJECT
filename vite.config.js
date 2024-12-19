import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'NFC Student Registration',
        short_name: 'NFC-Reg',
        description: 'NFC Student Registration System',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/NFC-StudentRegistration/',
        start_url: '/NFC-StudentRegistration/',
        icons: [
          {
            src: '/NFC-StudentRegistration/icons/icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/NFC-StudentRegistration/icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/NFC-StudentRegistration/icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        sourcemap: true,
        injectManifest: {
          injectionPoint: 'self.__WB_MANIFEST'
        }
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  base: '/NFC-StudentRegistration/'
})