import { PrismaService } from '@/application/providers/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
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

  async findById(props: FindMemberByIdProps) {
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

  async deleteUnique(memberId: string) {
    return await this.prisma.member.delete({ where: { id: memberId } });
  }
}
