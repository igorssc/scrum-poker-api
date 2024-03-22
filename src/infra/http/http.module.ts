import { PrismaModule } from '@/application/providers/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { RoomsController } from '../controllers/rooms.controllet';
import { WebSocketModule } from '../websockets/websockets.module';

@Module({
  imports: [PrismaModule, WebSocketModule],
  controllers: [RoomsController],
})
export class HttpModule {}
