import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Request, Response } from 'express';
import { AppModule } from './app.module';

let appPromise: Promise<INestApplication> | null = null;

async function createApp() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.enableShutdownHooks();

  app.enableCors({
    origin: '*',
    methods: '*',
  });

  await app.init();

  return app;
}

export default async function handler(req: Request, res: Response) {
  if (!appPromise) {
    appPromise = createApp();
  }

  const app = await appPromise;
  const expressApp = app.getHttpAdapter().getInstance();

  return expressApp(req, res);
}
