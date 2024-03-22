import { PrismaService } from '@/application/providers/prisma/prisma.service';
import { UsersRepository } from '@/application/repositories/users.repository';
import { Module } from '@nestjs/common';
import { CreateUserService } from './create-user.service';
import { FindUniqueUserService } from './find-unique-user.service';
import { UpdateUserService } from './update-user.service';
import { PrismaUsersRepository } from '@/application/repositories/implementations/prisma/users.repository';

@Module({
  providers: [
    CreateUserService,
    UpdateUserService,
    FindUniqueUserService,
    PrismaService,
    { provide: UsersRepository, useClass: PrismaUsersRepository },
  ],
  exports: [
    CreateUserService,
    UpdateUserService,
    FindUniqueUserService,
    UsersRepository,
  ],
})
export class UsersModule {}
