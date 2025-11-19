import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/qr-menu/',
  build: {
    outDir: '../qr-menu',
    emptyOutDir: true,
    assetsInlineLimit: 0, // Force all assets to be separate files
  },
})
