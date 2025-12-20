
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  // Base URL default '/', cocok untuk domain utama (public_html).
  // Jika deploy di subfolder (misal domain.com/pcc), ubah menjadi base: '/pcc/'
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Proxy ini hanya aktif saat mode DEV (npm run dev)
        changeOrigin: true,
        secure: false,
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
    // Pastikan folder output bersih sebelum build
    emptyOutDir: true,
  }
});
