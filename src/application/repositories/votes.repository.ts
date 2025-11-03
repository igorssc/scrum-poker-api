import { Prisma, Vote } from '@prisma/client';

export abstract class VotesRepository {
  create: (data: Prisma.VoteCreateInput) => Promise<Vote>;

  update: (id: string, data: Prisma.VoteUpdateInput) => Promise<Vote>;

  findByRoomAndTopic: (roomId: string, topic: string) => Promise<Vote | null>;

  findByRoomTopicAndSector: (
    roomId: string,
    topic: string,
    sector: string,
  ) => Promise<Vote | null>;

  findById: (id: string) => Promise<Vote | null>;
}
