import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    host: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3001,
      clientPort: 3001,
    },
    watch: {
      usePolling: false,
    },
    strictPort: false,
  },
  // Suppress WebSocket connection errors in console
  logLevel: 'error', // Only show actual errors, suppress warnings
  clearScreen: false, // Don't clear screen on errors
  build: {
    sourcemap: false,
  },
})
