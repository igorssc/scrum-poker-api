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
    // origin: 'http://localhost:3000',
    origin: '*',
    methods: '*',
  };

  app.enableCors(corsOptions);

  await app.listen(3000);
}
bootstrap();
