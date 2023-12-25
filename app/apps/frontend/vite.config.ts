import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import Pages from 'vite-plugin-pages';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {},

    plugins: [
      tsconfigPaths(),
      react(),
      Pages({
        dirs: 'src/pages',
      }),
    ],

    server: {
      host: true,
      port: 3001,
      proxy: {
        '/api': {
          target: env.VITE_URL_BACKEND || 'http://0.0.0.0:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },

    preview: {
      host: true,
      port: 3001,
      proxy: {
        '/api': {
          target: env.VITE_URL_BACKEND || 'http://0.0.0.0:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
})

