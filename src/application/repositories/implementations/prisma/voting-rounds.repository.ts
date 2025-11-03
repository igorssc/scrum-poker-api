import { Injectable } from '@nestjs/common';
import { Prisma, VotingRound } from '@prisma/client';
import { PrismaService } from '@/application/providers/prisma/prisma.service';
import { VotingRoundsRepository } from '../../voting-rounds.repository';

@Injectable()
export class PrismaVotingRoundsRepository implements VotingRoundsRepository {
  constructor(private prisma: PrismaService) {}

  create = async (
    data: Prisma.VotingRoundCreateInput,
  ): Promise<VotingRound> => {
    return await this.prisma.votingRound.create({
      data,
    });
  };

  update = async (
    id: string,
    data: Prisma.VotingRoundUpdateInput,
  ): Promise<VotingRound> => {
    return await this.prisma.votingRound.update({
      where: { id },
      data,
    });
  };

  findById = async (id: string): Promise<VotingRound | null> => {
    return await this.prisma.votingRound.findUnique({
      where: { id },
    });
  };
}
