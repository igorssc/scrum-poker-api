import { Prisma, User } from '@prisma/client';

export abstract class UsersRepository {
  create: (user: Prisma.UserCreateInput) => Promise<User>;

  totalCount: () => Promise<number>;

  update: (userId: string, user: Prisma.UserUpdateInput) => Promise<User>;

  findById: (id: string, includeRoom?: boolean) => Promise<User | null>;

  deleteUnique: (userId: string) => Promise<User>;
}
