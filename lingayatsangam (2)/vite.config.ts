import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  /* ===== PLUGINS ===== */
  plugins: [react()],

  /* ===== DEVELOPMENT SERVER ===== */
  server: {
    port: 5050,
    host: '0.0.0.0',
    strictPort: false,
  },

  /* ===== MODULE RESOLUTION ===== */
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },

  /* ===== PRODUCTION BUILD ===== */
  build: {
    /* Output Settings */
    outDir: 'dist',
    assetsDir: 'assets',

    /* Security: Disable source maps in production */
    sourcemap: false,

    /* Minification */
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.log in production
        drop_debugger: true  // Remove debugger statements
      },
      mangle: true,
      format: {
        comments: false
      }
    },

    /* Code Splitting for better caching */
    rollupOptions: {
      output: {
        manualChunks: {
          /* Vendor chunks */
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-animations': ['framer-motion', 'gsap'],
          'vendor-lucide': ['lucide-react'],
          'vendor-sentry': ['@sentry/react']
        },
        /* Optimize chunk names */
        chunkFileNames: 'assets/chunks/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },

    /* Performance optimizations */
    commonjsOptions: {
      include: /node_modules/,
      sourceMap: false
    },

    /* Chunk size warnings */
    chunkSizeWarningLimit: 500,  // Warn if chunk > 500KB
    reportCompressedSize: true,
    cssCodeSplit: true,
  },

  /* ===== OPTIMIZATION ===== */
  esbuild: {
    /* Drop console statements in production */
    drop: ['console', 'debugger']
  }
});
