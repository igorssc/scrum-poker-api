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
    const memberCreated = await this.prisma.member.create({
      data: { ...member },
      ...(includeUser && {
        include: {
          member: { select: { name: true, id: true, created_at: true } },
        },
      }),
    });

    return memberCreated;
  }

  async findByUserAndRoomId(props: FindMemberByIdProps, includeUser = false) {
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
  }

  async update(props: UpdateProps, member: Prisma.MemberUpdateInput) {
    const data = await this.prisma.member.updateMany({
      where: {
        user_id: props.userId,
        room_id: props.roomId,
      },
      data: member,
    });

    return data[0];
  }

  async deleteUnique({ userId, roomId }: DeleteMemberProps) {
    const memberDeleted = await this.prisma.member.deleteMany({
      where: { room_id: roomId, user_id: userId },
    });

    return memberDeleted[0];
  }
}
