import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['.monkeycode-ai.live'],
    proxy: {
      '/v1': {
        target: 'http://localhost:20128',
        changeOrigin: true,
      },
    },
  },
})
