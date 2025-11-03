import { Prisma, VotingRound } from '@prisma/client';
import { VotingRoundsRepository } from '../../voting-rounds.repository';

export class InMemoryVotingRoundsRepository implements VotingRoundsRepository {
  private votingRounds: VotingRound[] = [];

  create = async (
    data: Prisma.VotingRoundCreateInput,
  ): Promise<VotingRound> => {
    const votingRound: VotingRound = {
      id: Math.random().toString(36).substring(7),
      vote_id: data.vote?.connect?.id || '',
      voted_at: data.voted_at instanceof Date ? data.voted_at : new Date(),
      duration: typeof data.duration === 'number' ? data.duration : null,
      consensus: typeof data.consensus === 'string' ? data.consensus : null,
      winner_cards: Array.isArray(data.winner_cards) ? data.winner_cards : [],
    };

    this.votingRounds.push(votingRound);
    return votingRound;
  };

  update = async (
    id: string,
    data: Prisma.VotingRoundUpdateInput,
  ): Promise<VotingRound> => {
    const roundIndex = this.votingRounds.findIndex((round) => round.id === id);
    if (roundIndex === -1) {
      throw new Error('VotingRound not found');
    }

    // Extract simple values from Prisma update input
    const updateData: Partial<VotingRound> = {};
    if (data.voted_at instanceof Date) updateData.voted_at = data.voted_at;
    if (typeof data.duration === 'number') updateData.duration = data.duration;
    if (data.consensus && typeof data.consensus === 'string')
      updateData.consensus = data.consensus;
    if (Array.isArray(data.winner_cards))
      updateData.winner_cards = data.winner_cards;

    this.votingRounds[roundIndex] = {
      ...this.votingRounds[roundIndex],
      ...updateData,
    };

    return this.votingRounds[roundIndex];
  };

  findById = async (id: string): Promise<VotingRound | null> => {
    return this.votingRounds.find((round) => round.id === id) || null;
  };
}
