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

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [
    SignOutMemberService,
    SignInMemberService,
    VoteMemberService,
    ClearVotesMembersService,
    SignInAcceptMemberService,
    SignInRefuseMemberService,
    { provide: RoomsRepository, useClass: PrismaRoomsRepository },
    { provide: MembersRepository, useClass: PrismaMembersRepository },
  ],
  exports: [
    SignOutMemberService,
    SignInMemberService,
    VoteMemberService,
    ClearVotesMembersService,
    SignInAcceptMemberService,
    SignInRefuseMemberService,
  ],
})
export class MembersModule {}
