import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { fastify } from 'fastify';
import { AppModule } from './app.module';
import { randomUUID } from 'node:crypto';
import multiPart from '@fastify/multipart';
import * as process from 'node:process';

import middlewareOnRequest from './middleware/onRequest.middleware';
import middlewareOnResponse from './middleware/onResponse.middleware';

const fastifyInstance = fastify({
  disableRequestLogging: true,
  genReqId: () => randomUUID(),
  logger: { transport: { target: process.env?.NODE_ENV === 'prod' ? null : 'pino-pretty' } },
});

middlewareOnRequest(fastifyInstance);
middlewareOnResponse(fastifyInstance);
fastifyInstance.register(multiPart, { limits: { files: 20, fileSize: 1073741824 } });

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(fastifyInstance as any), {
    cors: true,
    bufferLogs: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000, '0.0.0.0');
}

bootstrap();
