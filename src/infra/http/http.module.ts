import { PrismaModule } from '@/application/providers/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { RoomsController } from '../controllers/rooms.controller';
import { WebSocketModule } from '../websockets/websockets.module';
import { UsersModule } from '@/application/use-cases/users/users.module';
import { RoomsModule } from '@/application/use-cases/rooms/rooms.module';

@Module({
  imports: [PrismaModule, WebSocketModule, UsersModule, RoomsModule],
  controllers: [RoomsController],
})
export class HttpModule {}
