import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'development' ? '/' : './',
  plugins: [react()],
  server: {
    // Allow Codesandbox preview hosts
    allowedHosts: ['6zw67f-5173.csb.app', '6zw67f-5175.csb.app', '6zw67f-5176.csb.app','hk3q2w-5173.csb.app'],
    proxy: {
      // Dev proxy to avoid CORS when calling external LLMs
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'https://free.v36.cm',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
}))
