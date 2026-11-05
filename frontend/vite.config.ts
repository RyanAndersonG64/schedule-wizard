/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward API calls to the FastAPI backend during development
      '/api': 'http://localhost:8000',
    },
  },
  test: {
    // Date tests depend on the timezone (daylight saving especially), so pin one
    env: { TZ: 'America/New_York' },
  },
})
