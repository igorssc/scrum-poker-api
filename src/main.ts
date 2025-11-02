import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.enableShutdownHooks();

  const corsOptions = {
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://scrumpoker.dev.br'] // Replace with your actual frontend domain
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  };

  app.enableCors(corsOptions);

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`WebSocket enabled with polling fallback`);
  });

  return app;
}

// For serverless environments like Vercel
export default bootstrap;

// For traditional server environments
if (require.main === module) {
  bootstrap();
}
