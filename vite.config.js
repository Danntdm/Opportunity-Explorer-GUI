import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api requests to the Python server (server/) during development.
    proxy: {
      '/api': apiTarget,
    },
  },
})
