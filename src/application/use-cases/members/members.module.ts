import { Module } from '@nestjs/common';
import { PrismaModule } from '@/application/providers/prisma/prisma.module';
import { MembersRepository } from '@/application/repositories/members.repository';
import { PrismaMembersRepository } from '@/application/repositories/implementations/prisma/members.repository';
import { SignOutMemberService } from './sign-out-member.service';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { PrismaRoomsRepository } from '@/application/repositories/implementations/prisma/rooms.repository';
import { VoteMemberService } from './vote-member.service';
import { ClearVotesMembersService } from './clear-votes-members.service';
import { SignInMemberService } from './sign-in-member.service';
import { UsersModule } from '../users/users.module';
import { SignInAcceptMemberService } from './sign-in-accept-member.service';
import { SignInRefuseMemberService } from './sign-in-refuse-member.service';
import { RevealVotesMembersService } from './reveal-votes-members.service';
import { VotesRepository } from '@/application/repositories/votes.repository';
import { PrismaVotesRepository } from '@/application/repositories/implementations/prisma/votes.repository';
import { VotingRoundsRepository } from '@/application/repositories/voting-rounds.repository';
import { PrismaVotingRoundsRepository } from '@/application/repositories/implementations/prisma/voting-rounds.repository';
import { VoteDetailsRepository } from '@/application/repositories/vote-details.repository';
import { PrismaVoteDetailsRepository } from '@/application/repositories/implementations/prisma/vote-details.repository';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [
    SignOutMemberService,
    SignInMemberService,
    VoteMemberService,
    ClearVotesMembersService,
    SignInAcceptMemberService,
    SignInRefuseMemberService,
    RevealVotesMembersService,
    { provide: RoomsRepository, useClass: PrismaRoomsRepository },
    { provide: MembersRepository, useClass: PrismaMembersRepository },
    { provide: VotesRepository, useClass: PrismaVotesRepository },
    { provide: VotingRoundsRepository, useClass: PrismaVotingRoundsRepository },
    { provide: VoteDetailsRepository, useClass: PrismaVoteDetailsRepository },
  ],
  exports: [
    SignOutMemberService,
    SignInMemberService,
    VoteMemberService,
    ClearVotesMembersService,
    SignInAcceptMemberService,
    SignInRefuseMemberService,
    RevealVotesMembersService,
  ],
})
export class MembersModule {}
