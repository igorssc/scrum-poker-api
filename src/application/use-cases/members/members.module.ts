import { Module } from '@nestjs/common';
import { PrismaModule } from '@/application/providers/prisma/prisma.module';
import { MembersRepository } from '@/application/repositories/members.repository';
import { PrismaMembersRepository } from '@/application/repositories/implementations/prisma/members.repository';
import { SignOutMemberService } from './sign-out-member.service';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { PrismaRoomsRepository } from '@/application/repositories/implementations/prisma/rooms.repository';
import { VoteMemberService } from './vote-member.service';
import { ClearVotesMembersService } from './clear-votes-members.service';

@Module({
  imports: [PrismaModule],
  providers: [
    SignOutMemberService,
    VoteMemberService,
    ClearVotesMembersService,
    { provide: RoomsRepository, useClass: PrismaRoomsRepository },
    { provide: MembersRepository, useClass: PrismaMembersRepository },
  ],
  exports: [SignOutMemberService, VoteMemberService, ClearVotesMembersService],
})
export class MembersModule {}
