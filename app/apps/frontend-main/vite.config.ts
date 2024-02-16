import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import Pages from 'vite-plugin-pages';
import svgr from 'vite-plugin-svgr';
import process from 'process';

export default defineConfig(({ mode }) => {
  const prefix = process.env?.VITE_PREFIX ? `/${process.env.VITE_PREFIX}` : '';

  return {
    define: {
      prefix: JSON.stringify({ value: prefix }),
    },

    plugins: [
      tsconfigPaths(),
      svgr(),
      react(),
      Pages({
        dirs: 'src/pages',
        importMode: 'async',
      }),
    ],

    server: {
      port: 3001,
      proxy: {
        '/api': {
          target: process.env.VITE_SERVICE_BACKEND || 'http://0.0.0.0:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },

        '/cdn': {
          target: process.env.VITE_SERVICE_CDN || 'http://0.0.0.0:3002',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/cdn/, ''),
        },
      },
    },

    preview: {
      host: true,
      port: 3000,
      proxy: {
        '/api': {
          target: process.env.VITE_SERVICE_BACKEND || 'http://0.0.0.0:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },

        '/cdn': {
          target: process.env.VITE_SERVICE_CDN || 'http://0.0.0.0:3002',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/cdn/, ''),
        },
      },
    },
  };
});
