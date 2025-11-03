import { Prisma, Vote } from '@prisma/client';
import { VotesRepository } from '../../votes.repository';

export class InMemoryVotesRepository implements VotesRepository {
  private votes: Vote[] = [];

  create = async (data: Prisma.VoteCreateInput): Promise<Vote> => {
    const vote: Vote = {
      id: Math.random().toString(36).substring(7),
      room_id: data.room?.connect?.id || '',
      topic: data.topic,
      sector: data.sector,
      created_at: new Date(),
      finalized_at: null,
      total_duration: null,
      final_consensus: null,
    };

    this.votes.push(vote);
    return vote;
  };

  update = async (id: string, data: Prisma.VoteUpdateInput): Promise<Vote> => {
    const voteIndex = this.votes.findIndex((vote) => vote.id === id);
    if (voteIndex === -1) {
      throw new Error('Vote not found');
    }

    // Extract simple values from Prisma update input
    const updateData: Partial<Vote> = {};
    if (data.topic && typeof data.topic === 'string')
      updateData.topic = data.topic;
    if (data.sector && typeof data.sector === 'string')
      updateData.sector = data.sector;
    if (data.finalized_at instanceof Date)
      updateData.finalized_at = data.finalized_at;
    if (typeof data.total_duration === 'number')
      updateData.total_duration = data.total_duration;
    if (data.final_consensus && typeof data.final_consensus === 'string')
      updateData.final_consensus = data.final_consensus;

    this.votes[voteIndex] = {
      ...this.votes[voteIndex],
      ...updateData,
    };

    return this.votes[voteIndex];
  };

  findByRoomAndTopic = async (
    roomId: string,
    topic: string,
  ): Promise<Vote | null> => {
    const votes = this.votes
      .filter((vote) => vote.room_id === roomId && vote.topic === topic)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    return votes[0] || null;
  };

  findByRoomTopicAndSector = async (
    roomId: string,
    topic: string,
    sector: string,
  ): Promise<Vote | null> => {
    const votes = this.votes
      .filter(
        (vote) =>
          vote.room_id === roomId &&
          vote.topic === topic &&
          vote.sector === sector,
      )
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    return votes[0] || null;
  };

  findById = async (id: string): Promise<Vote | null> => {
    return this.votes.find((vote) => vote.id === id) || null;
  };
}
