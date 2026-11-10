import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// `base: './'` keeps asset paths relative, so the build works from any folder
// (GitHub Pages subpath, Vercel, Netlify or a plain file server).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
