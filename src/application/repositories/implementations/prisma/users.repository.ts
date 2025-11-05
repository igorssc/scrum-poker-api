import { PrismaService } from '@/application/providers/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersRepository } from '../../users.repository';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  async create(user: Prisma.UserCreateInput) {
    return await PrismaService.executeWithRetry(async () => {
      return await this.prisma.user.create({
        data: { ...user },
      });
    });
  }

  async findById(id: string, includeRoom = false) {
    return await PrismaService.executeWithRetry(async () => {
      return await this.prisma.user.findUnique({
        where: {
          id,
        },
        ...(includeRoom && {
          include: {
            rooms: true,
          },
        }),
      });
    });
  }

  async totalCount() {
    return await PrismaService.executeWithRetry(async () => {
      return await this.prisma.user.count();
    });
  }

  async update(userId: string, user: Prisma.UserUpdateInput) {
    return await PrismaService.executeWithRetry(async () => {
      return await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: user,
      });
    });
  }

  async deleteUnique(userId: string) {
    return await PrismaService.executeWithRetry(async () => {
      return await this.prisma.user.delete({ where: { id: userId } });
    });
  }
}
