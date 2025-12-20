
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  // Base URL default '/', cocok untuk domain utama (public_html).
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Diarahkan ke IP lokal Laravel
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Memastikan /api tetap ada jika Laravel membutuhkannya
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios', 'lucide-react'],
          charts: ['recharts'],
          utils: ['xlsx']
        }
      }
    }
  }
});
