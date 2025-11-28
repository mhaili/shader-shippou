import { defineConfig } from 'vite'

export default defineConfig({
  base: '/shader-shippou/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  server: {
    port: 5173,
    open: true
  }
})