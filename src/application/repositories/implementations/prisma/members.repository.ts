import { PrismaService } from '@/application/providers/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  DeleteMemberProps,
  FindMemberByIdProps,
  MembersRepository,
  UpdateProps,
} from '../../members.repository';

@Injectable()
export class PrismaMembersRepository implements MembersRepository {
  constructor(private prisma: PrismaService) {}

  async create(member: Prisma.MemberCreateInput, includeUser = false) {
    return await PrismaService.executeWithRetry(async () => {
      return await this.prisma.member.create({
        data: { ...member },
        ...(includeUser && {
          include: {
            member: { select: { name: true, id: true, created_at: true } },
          },
        }),
      });
    });
  }

  async findByUserAndRoomId(props: FindMemberByIdProps, includeUser = false) {
    return await PrismaService.executeWithRetry(async () => {
      const member = await this.prisma.member.findFirst({
        where: {
          user_id: props.userId,
          room_id: props.roomId,
        },
        ...(includeUser && {
          include: {
            member: { select: { name: true, id: true, created_at: true } },
          },
        }),
      });

      return member;
    });
  }

  async findAllByRoomId(roomId: string) {
    return await PrismaService.executeWithRetry(async () => {
      return await this.prisma.member.findMany({
        where: {
          room_id: roomId,
        },
      });
    });
  }

  async update(props: UpdateProps, member: Prisma.MemberUpdateInput) {
    return await PrismaService.executeWithRetry(async () => {
      // Atualiza os membros
      await this.prisma.member.updateMany({
        where: {
          ...(props.userId && { user_id: props.userId }),
          room_id: props.roomId,
        },
        data: member,
      });

      // Retorna o membro atualizado
      const updatedMember = await this.prisma.member.findFirst({
        where: {
          ...(props.userId && { user_id: props.userId }),
          room_id: props.roomId,
        },
      });

      return updatedMember!;
    });
  }

  async deleteUnique({ userId, roomId }: DeleteMemberProps) {
    return await PrismaService.executeWithRetry(async () => {
      const memberToDelete = await this.prisma.member.findFirst({
        where: { room_id: roomId, user_id: userId },
      });

      await this.prisma.member.deleteMany({
        where: { room_id: roomId, user_id: userId },
      });

      return memberToDelete!;
    });
  }
}
