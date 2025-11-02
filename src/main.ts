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

  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

}
bootstrap();
