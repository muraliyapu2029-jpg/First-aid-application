import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Backend (server/) runs on :4000 in dev. Proxy /api so the frontend
// can call it same-origin and the Sarvam key never reaches the browser.
const apiProxy = {
  '/api': {
    target: process.env.RAKSHA_API_URL || 'http://localhost:4000',
    changeOrigin: true,
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: apiProxy,
  },
  preview: {
    proxy: apiProxy,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
