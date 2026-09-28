import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_API_URL || 'http://127.0.0.1:8000';

  return {
    plugins: [react()],
    // Expose backend URL to the app at build time
    define: {
      __API_BASE__: JSON.stringify(backendUrl),
    },
    server: {
      port: 5173,
      host: true,
      // Dev-only proxy — not used in Vercel production build
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
