import { DataSource } from 'typeorm';
import * as path from 'node:path';
import * as process from 'process';

const config = {
  env: process.env.NODE_ENV || 'dev',
  secret: process.env.APP_SECRET || 'mvp_secret',

  upload: {
    dir: process.env.APP_UPLOAD_DIR || path.join(process.cwd(), 'files'),
  },

  url: {
    frontend: process.env.URL_FRONTEND || '',
    backend: process.env.URL_BACKEND || '',
  },

  db: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    user: process.env.POSTGRES_USER || 'mvp_user',
    pass: process.env.POSTGRES_PASSWORD || 'mvp_pass',
    name: process.env.POSTGRES_DB || 'mvp',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },

  telegram: {
    botMain: process.env.TELEGRAM_BOT_MAIN_TOKEN || '',
    botCreator: process.env.TELEGRAM_BOT_MAIN_TOKEN || '',
  },
};

export default () => config;

export const connectionSource = new DataSource({
  type: 'postgres',
  host: config.db.host,
  port: config.db.port,
  username: config.db.user,
  password: config.db.pass,
  database: config.db.name,
  migrations: [path.join(__dirname, 'db', 'migration', '**', '*.js')],
});
