import { Module } from '@nestjs/common';
import { HttpModule } from './infra/http/http.module';
import { PrismaModule } from './application/providers/prisma/prisma.module';
import { WebSocketModule } from './infra/websockets/websockets.module';
import { HealthController } from './infra/controllers/health.controller';

@Module({
  imports: [HttpModule, PrismaModule, WebSocketModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
