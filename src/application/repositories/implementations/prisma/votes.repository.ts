import { Injectable } from '@nestjs/common';
import { Prisma, Vote } from '@prisma/client';
import { PrismaService } from '@/application/providers/prisma/prisma.service';
import { VotesRepository } from '../../votes.repository';

@Injectable()
export class PrismaVotesRepository implements VotesRepository {
  constructor(private prisma: PrismaService) {}

  create = async (data: Prisma.VoteCreateInput): Promise<Vote> => {
    return await this.prisma.vote.create({
      data,
    });
  };

  update = async (id: string, data: Prisma.VoteUpdateInput): Promise<Vote> => {
    return await this.prisma.vote.update({
      where: { id },
      data,
    });
  };

  findByRoomAndTopic = async (
    roomId: string,
    topic: string,
  ): Promise<Vote | null> => {
    return await this.prisma.vote.findFirst({
      where: {
        room_id: roomId,
        topic,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  };

  findByRoomTopicAndSector = async (
    roomId: string,
    topic: string,
    sector: string,
  ): Promise<Vote | null> => {
    return await this.prisma.vote.findFirst({
      where: {
        room_id: roomId,
        topic,
        sector,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  };

  findById = async (id: string): Promise<Vote | null> => {
    return await this.prisma.vote.findUnique({
      where: { id },
    });
  };
}
