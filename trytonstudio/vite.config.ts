import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// `base: './'` keeps asset paths relative, so the build works from any folder
// (GitHub Pages subpath, Vercel, Netlify or a plain file server).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    // The only chunk above the default 500 kB is the 3D trident (three.js). It
    // is downloaded on demand, after the first paint, and only on devices that
    // will draw it (RF-20, RNF-09). `npm run verify` checks the initial bundle.
    chunkSizeWarningLimit: 640,
  },
})
