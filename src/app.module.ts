import { Module } from '@nestjs/common';
import { HttpModule } from './infra/http/http.module';
import { PrismaModule } from './application/providers/prisma/prisma.module';
import { WebSocketModule } from './infra/websockets/websockets.module';

@Module({
  imports: [HttpModule, PrismaModule, WebSocketModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
