import { PrismaService } from '@/application/providers/prisma/prisma.service';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Module } from '@nestjs/common';
import { CreateRoomService } from '../rooms/create-room.service';
import { UpdateRoomService } from '../rooms/update-room.service';
import { PrismaRoomsRepository } from '@/application/repositories/implementations/prisma/rooms.repository';
import { UsersModule } from '../users/users.module';
import { FindAllRoomsByLocationService } from './find-all-rooms-by-location.service';
import { FindUniqueRoomService } from './find-unique-room.service';

@Module({
  imports: [UsersModule],
  providers: [
    CreateRoomService,
    UpdateRoomService,
    FindUniqueRoomService,
    FindAllRoomsByLocationService,
    PrismaService,
    { provide: RoomsRepository, useClass: PrismaRoomsRepository },
  ],
  exports: [
    CreateRoomService,
    UpdateRoomService,
    FindUniqueRoomService,
    FindAllRoomsByLocationService,
    RoomsRepository,
  ],
})
export class RoomsModule {}
