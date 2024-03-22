import { PrismaService } from '@/application/providers/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  DeleteMemberProps,
  FindMemberByIdProps,
  MembersRepository,
} from '../../members.repository';

@Injectable()
export class PrismaMembersRepository implements MembersRepository {
  constructor(private prisma: PrismaService) {}

  async create(member: Prisma.MemberCreateInput) {
    const memberCreated = await this.prisma.member.create({
      data: { ...member },
    });

    return memberCreated;
  }

  async findByMemberAndRoomId(props: FindMemberByIdProps) {
    const member = await this.prisma.member.findFirst({
      where: {
        member_id: props.memberId,
        room_id: props.roomId,
      },
    });

    return member;
  }

  async update(memberId: string, member: Prisma.MemberUpdateInput) {
    const data = await this.prisma.member.update({
      where: {
        id: memberId,
      },
      data: member,
    });

    return data;
  }

  async deleteUnique({ memberId, roomId }: DeleteMemberProps) {
    const memberDeleted = await this.prisma.member.deleteMany({
      where: { room_id: roomId, member_id: memberId },
    });

    return memberDeleted[0];
  }
}
