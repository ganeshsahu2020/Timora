// vite.config.js (client)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  server: {
    port: 5161,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5164',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 5161,
    strictPort: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['timora-icon.svg', 'timora-wordmark.svg'],
      manifest: {
        name: 'Timora',
        short_name: 'Timora',
        description: 'Small Habits, Big Momentum.',
        theme_color: '#7C3AED',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // offline fallback for navigations
      workbox: {
        navigateFallback: '/offline.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
      },
      // devOptions: { enabled: true }, // uncomment to test SW in dev if you want
    }),
  ],
  resolve: {
    alias: {
      'es-toolkit/compat/get': path.resolve(
        process.cwd(),
        'src/shims/es-toolkit-compat-get.js'
      ),
      'es-toolkit/compat/get.js': path.resolve(
        process.cwd(),
        'src/shims/es-toolkit-compat-get.js'
      ),
    },
  },
  optimizeDeps: { force: true },
});
