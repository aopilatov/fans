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
    frontend: process.env.URL_FRONTEND || 'https://9ac6-62-65-222-193.ngrok-free.app',
    backend: process.env.URL_BACKEND || 'https://9ac6-62-65-222-193.ngrok-free.app/api',
    cdn: process.env.URL_CDN || 'https://9ac6-62-65-222-193.ngrok-free.app/cdn',
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
    botMain: process.env.TELEGRAM_BOT_MAIN_TOKEN || '6899381215:AAEtXqjQKUs4AUKSk2DSl-fJ-IWVdpF0Juo',
    botCreator: process.env.TELEGRAM_BOT_CREATOR_TOKEN || '6642601944:AAGUXQrovRT83caZMY9VjzLaMczZ7kq3NzA',
    botAgency: process.env.TELEGRAM_BOT_AGENCY_TOKEN || '6970627762:AAHtTZ7Prr4Cdjfx8ud3NRByDuBlH3bhoCM',
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
