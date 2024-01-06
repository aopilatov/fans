import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import Pages from 'vite-plugin-pages';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const prefix = env?.VITE_PREFIX ? `/${env.VITE_PREFIX}` : '';

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
});
