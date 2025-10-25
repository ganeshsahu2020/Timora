// vite.config.js (client)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
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
  plugins: [react()],
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
