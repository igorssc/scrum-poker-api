import { PrismaService } from '@/application/providers/prisma/prisma.service';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Module } from '@nestjs/common';
import { CreateRoomService } from '../rooms/create-room.service';
import { UpdateRoomService } from '../rooms/update-room.service';
import { PrismaRoomsRepository } from '@/application/repositories/implementations/prisma/rooms.repository';
import { FindUniqueRoomByIdService } from './find-unique-room-by-id.service';
import { FindUniqueRoomByLocationService } from './find-unique-room-by-location.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [
    CreateRoomService,
    UpdateRoomService,
    FindUniqueRoomByIdService,
    FindUniqueRoomByLocationService,
    PrismaService,
    { provide: RoomsRepository, useClass: PrismaRoomsRepository },
  ],
  exports: [
    CreateRoomService,
    UpdateRoomService,
    FindUniqueRoomByIdService,
    FindUniqueRoomByLocationService,
    RoomsRepository,
  ],
})
export class RoomsModule {}
