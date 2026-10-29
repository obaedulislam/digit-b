import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Laravel is proxied in dev so the Sanctum session cookie stays same-origin.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Port 8000 is often taken on Windows (HTTP.sys/IIS); the API dev server uses 8001.
  const backend = env.VITE_PROXY_TARGET || 'http://127.0.0.1:8001';
  const proxied = Object.fromEntries(
    ['/api', '/sanctum', '/storage', '/sitemap.xml', '/robots.txt'].map((path) => [
      path,
      { target: backend, changeOrigin: false },
    ]),
  );

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          // lets every partial `@use 'abstracts' as *;`
          loadPaths: [fileURLToPath(new URL('./src/styles', import.meta.url))],
        },
      },
    },
    server: { port: 5173, strictPort: true, proxy: proxied },
    preview: { port: 4173, proxy: proxied },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (/node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'react';
            if (id.includes('@mantine')) return 'mantine';
            return undefined;
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.js'],
      css: false,
    },
  };
});
