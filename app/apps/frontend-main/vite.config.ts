import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import Pages from 'vite-plugin-pages';
import svgr from 'vite-plugin-svgr';
import process from 'process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const prefix = env?.VITE_PREFIX ? `/${env.VITE_PREFIX}` : '';
  const cdn = env?.VITE_URL_CDN || 'http://localhost:3002';

  return {
    define: {
      prefix: JSON.stringify({ value: prefix }),
      cdn: JSON.stringify({ value: cdn }),
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
          target: env.VITE_SERVICE_BACKEND || 'http://0.0.0.0:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },

        '/cdn': {
          target: env.VITE_SERVICE_CDN || 'http://0.0.0.0:3002',
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
          target: env.VITE_SERVICE_BACKEND || 'http://0.0.0.0:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },

        '/cdn': {
          target: env.VITE_SERVICE_CDN || 'http://0.0.0.0:3002',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/cdn/, ''),
        },
      },
    },
  };
});
