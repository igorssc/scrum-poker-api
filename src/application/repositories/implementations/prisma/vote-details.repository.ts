import { Injectable } from '@nestjs/common';
import { Prisma, VoteDetail } from '@prisma/client';
import { PrismaService } from '@/application/providers/prisma/prisma.service';
import { VoteDetailsRepository } from '../../vote-details.repository';

@Injectable()
export class PrismaVoteDetailsRepository implements VoteDetailsRepository {
  constructor(private prisma: PrismaService) {}

  create = async (data: Prisma.VoteDetailCreateInput): Promise<VoteDetail> => {
    return await this.prisma.voteDetail.create({
      data,
    });
  };

  createMany = async (data: Prisma.VoteDetailCreateInput[]): Promise<void> => {
    await this.prisma.voteDetail.createMany({
      data: data.map((item) => ({
        voting_round_id: item.voting_round?.connect?.id || '',
        user_id: item.user?.connect?.id || '',
        card: item.card,
      })),
    });
  };

  findById = async (id: string): Promise<VoteDetail | null> => {
    return await this.prisma.voteDetail.findUnique({
      where: { id },
    });
  };
}
