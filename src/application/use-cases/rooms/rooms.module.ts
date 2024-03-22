import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Module } from '@nestjs/common';
import { CreateRoomService } from '../rooms/create-room.service';
import { UpdateRoomService } from '../rooms/update-room.service';
import { PrismaRoomsRepository } from '@/application/repositories/implementations/prisma/rooms.repository';
import { UsersModule } from '../users/users.module';
import { FindAllRoomsByLocationService } from './find-all-rooms-by-location.service';
import { FindUniqueRoomService } from './find-unique-room.service';
import { PrismaModule } from '@/application/providers/prisma/prisma.module';
import { MembersRepository } from '@/application/repositories/members.repository';
import { PrismaMembersRepository } from '@/application/repositories/implementations/prisma/members.repository';
import { MembersModule } from '../members/members.module';
import { DeleteUniqueRoomService } from './delete-unique-room.service';
import { VoteRoomService } from './vote-room.service';
import { ClearVotesRoomService } from './clear-votes-room.service';

@Module({
  imports: [UsersModule, PrismaModule, MembersModule],
  providers: [
    CreateRoomService,
    UpdateRoomService,
    FindUniqueRoomService,
    FindAllRoomsByLocationService,
    DeleteUniqueRoomService,
    VoteRoomService,
    ClearVotesRoomService,
    { provide: RoomsRepository, useClass: PrismaRoomsRepository },
    { provide: MembersRepository, useClass: PrismaMembersRepository },
  ],
  exports: [
    CreateRoomService,
    UpdateRoomService,
    FindUniqueRoomService,
    FindAllRoomsByLocationService,
    DeleteUniqueRoomService,
    VoteRoomService,
    ClearVotesRoomService,
    RoomsRepository,
  ],
})
export class RoomsModule {}
