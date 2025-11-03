import { Prisma, VotingRound } from '@prisma/client';

export abstract class VotingRoundsRepository {
  create: (data: Prisma.VotingRoundCreateInput) => Promise<VotingRound>;

  update: (
    id: string,
    data: Prisma.VotingRoundUpdateInput,
  ) => Promise<VotingRound>;

  findById: (id: string) => Promise<VotingRound | null>;
}
