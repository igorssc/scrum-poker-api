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
import { RevealVotesMembersService } from '../members/reveal-votes-members.service';
import { CleanupInactiveRoomsService } from './cleanup-inactive-rooms.service';
import { VotesRepository } from '@/application/repositories/votes.repository';
import { VoteDetailsRepository } from '@/application/repositories/vote-details.repository';
import { VotingRoundsRepository } from '@/application/repositories/voting-rounds.repository';
import { PrismaVotesRepository } from '@/application/repositories/implementations/prisma/votes.repository';
import { PrismaVoteDetailsRepository } from '@/application/repositories/implementations/prisma/vote-details.repository';
import { PrismaVotingRoundsRepository } from '@/application/repositories/implementations/prisma/voting-rounds.repository';

@Module({
  imports: [UsersModule, PrismaModule, MembersModule],
  providers: [
    CreateRoomService,
    UpdateRoomService,
    FindUniqueRoomService,
    FindAllRoomsByLocationService,
    DeleteUniqueRoomService,
    RevealVotesMembersService,
    CleanupInactiveRoomsService,
    { provide: RoomsRepository, useClass: PrismaRoomsRepository },
    { provide: MembersRepository, useClass: PrismaMembersRepository },
    { provide: VotesRepository, useClass: PrismaVotesRepository },
    { provide: VoteDetailsRepository, useClass: PrismaVoteDetailsRepository },
    { provide: VotingRoundsRepository, useClass: PrismaVotingRoundsRepository },
  ],
  exports: [
    CreateRoomService,
    UpdateRoomService,
    FindUniqueRoomService,
    FindAllRoomsByLocationService,
    DeleteUniqueRoomService,
    RevealVotesMembersService,
    CleanupInactiveRoomsService,
    RoomsRepository,
    VotesRepository,
    VoteDetailsRepository,
    VotingRoundsRepository,
  ],
})
export class RoomsModule {}
