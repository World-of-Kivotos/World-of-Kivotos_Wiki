import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { contentMarkdown } from './tools/vite-plugin-content.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [contentMarkdown(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
