import { Prisma, VoteDetail } from '@prisma/client';
import { VoteDetailsRepository } from '../../vote-details.repository';

export class InMemoryVoteDetailsRepository implements VoteDetailsRepository {
  private voteDetails: VoteDetail[] = [];

  create = async (data: Prisma.VoteDetailCreateInput): Promise<VoteDetail> => {
    const voteDetail: VoteDetail = {
      id: Math.random().toString(36).substring(7),
      voting_round_id: data.voting_round?.connect?.id || '',
      user_id: data.user?.connect?.id || '',
      card: data.card,
      created_at: new Date(),
    };

    this.voteDetails.push(voteDetail);
    return voteDetail;
  };

  createMany = async (data: Prisma.VoteDetailCreateInput[]): Promise<void> => {
    for (const detail of data) {
      await this.create(detail);
    }
  };

  findById = async (id: string): Promise<VoteDetail | null> => {
    return this.voteDetails.find((detail) => detail.id === id) || null;
  };
}
