import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module.js';

let cachedApp = null;

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  try {
    const app = await NestFactory.create(AppModule, {
      logger: false,
    });

    app.enableCors({
      origin: true,
      credentials: true,
    });

    await app.init();
    cachedApp = app;
    return app;
  } catch (error) {
    console.error('Error creating NestJS app:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  try {
    const app = await createApp();
    const server = app.getHttpAdapter().getInstance();
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(200).json({});
      return;
    }

    return server(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
}