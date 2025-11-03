import { Prisma, VoteDetail } from '@prisma/client';

export abstract class VoteDetailsRepository {
  create: (data: Prisma.VoteDetailCreateInput) => Promise<VoteDetail>;

  createMany: (data: Prisma.VoteDetailCreateInput[]) => Promise<void>;

  findById: (id: string) => Promise<VoteDetail | null>;
}
