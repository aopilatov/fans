import { fastify } from 'fastify';
import { createServer, ViteDevServer } from 'vite';
import compression from 'compression';
import sirv from 'sirv';
import middie from '@fastify/middie';
// import helmet from '@fastify/helmet';
import fs from 'node:fs';
import process from 'node:process';

const isProduction = process.env.NODE_ENV === 'prod';
const port = parseInt(process.env?.PORT || '3001');
const base = process.env.BASE || '/';
let vite: ViteDevServer;

const templateHtml = isProduction
  ? fs.readFileSync('./dist/client/index.html', { encoding: 'utf-8' })
  : '';

const ssrManifest = isProduction
  ? fs.readFileSync('./dist/client/.vite/ssr-manifest.json', { encoding: 'utf-8' })
  : undefined;

const app = fastify({
  ignoreTrailingSlash: true,
  logger: false,
});

// app.register(helmet, { contentSecurityPolicy: false });
app.register(middie)
  .after(async () => {
    if (!isProduction) {
      vite = await createServer({
        server: { middlewareMode: true },
        appType: 'custom',
        base,
      });
      app.use(vite.middlewares);
    } else {
      app.use(compression());
      app.use(base, sirv('./dist/client', { extensions: [] }));
    }
  });

app.all('*', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '');
    let template;
    let render;

    if (!isProduction) {
      template = fs.readFileSync('./index.html', { encoding: 'utf-8' });
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
    } else {
      template = templateHtml;
      render = (await import('./entry-server.js')).render;
    }

    const rendered = await render(url, ssrManifest);
    const html = template.replace(`<!--ssr-outlet-->`, rendered);
    // const html = template
    //   .replace(`<!--app-head-->`, rendered.head ?? '')
    //   .replace(`<!--app-html-->`, rendered.html ?? '');

    res.code(200).header('Content-Type', 'text/html').send(html);
  } catch (e: any) {
    vite?.ssrFixStacktrace(e);
    console.log(e.stack);
    res.code(500).send(e.stack);
  }
});

app.listen({
  host: '0.0.0.0',
  port,
}, (err: Error | null, address: string) => {
  if (err) throw new Error(err?.message || 'Can not start server');
  console.info(`Server started at ${address}`);
});

process.on('SIGTERM', async (): Promise<void> => {
  console.info('SIGTERM signal received');
  process.exit(1);
});

process.on('SIGINT', async (): Promise<void> => {
  console.info('SIGINT signal received (Ctrl-C)');
  process.exit(0);
});
