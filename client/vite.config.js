import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      clientPort: 5174,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          const match = id.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/)
          const packageName = match?.[1]

          if (!packageName) {
            return 'vendor'
          }

          if (packageName === 'react' || packageName === 'react-dom' || packageName === 'scheduler') {
            return 'react-vendor';
          }

          if (packageName === 'react-router-dom' || packageName === '@remix-run/router') {
            return 'router';
          }

          if (packageName === '@reduxjs/toolkit' || packageName === 'react-redux' || packageName === 'redux') {
            return 'redux';
          }

          if (packageName === '@ant-design/icons') {
            return 'ant-icons';
          }

          if (packageName === 'antd') {
            const componentMatch = id.match(/antd\/(?:es|lib)\/([^/]+)/)
            return componentMatch ? `antd-${componentMatch[1]}` : 'antd-core'
          }

          if (packageName === 'framer-motion' || packageName === 'motion-dom' || packageName === 'motion-utils' || packageName === 'tslib') {
            return 'framer';
          }

          if (packageName === 'i18next' || packageName === 'react-i18next' || packageName === 'i18next-browser-languagedetector' || packageName === 'i18next-http-backend') {
            return 'i18n';
          }

          if (packageName === 'axios') {
            return 'axios';
          }

          if (packageName === 'socket.io-client' || packageName === 'engine.io-client' || packageName === 'socket.io-parser') {
            return 'socketio';
          }

          if (packageName === 'dayjs') {
            return 'dayjs';
          }

          if (packageName === 'recharts' || packageName.startsWith('d3-') || packageName === 'internmap') {
            return 'charts';
          }

          return `pkg-${packageName.replace('@', '').replace(/\//g, '-')}`;
        }
      }
    },
    chunkSizeWarningLimit: 400,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  },
})