import { defineConfig } from 'vite'

export default defineConfig({
  base: '/shader-shippou/',  // Remplacez par le nom de votre repository GitHub
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,  // Optionnel: désactive les sourcemaps en production
  },
  server: {
    port: 5173,
    open: true  // Ouvre automatiquement le navigateur
  }
})