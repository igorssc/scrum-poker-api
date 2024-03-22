import { Module } from '@nestjs/common';
import { PrismaModule } from '@/application/providers/prisma/prisma.module';
import { MembersRepository } from '@/application/repositories/members.repository';
import { PrismaMembersRepository } from '@/application/repositories/implementations/prisma/members.repository';
import { SignOutMemberService } from './sign-out-member.service';

@Module({
  imports: [PrismaModule],
  providers: [
    SignOutMemberService,
    { provide: MembersRepository, useClass: PrismaMembersRepository },
  ],
  exports: [SignOutMemberService],
})
export class MembersModule {}
