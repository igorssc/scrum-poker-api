import { Prisma, Member } from '@prisma/client';

export interface FindMemberByIdProps {
  memberId: string;
  roomId: string;
}

export abstract class MembersRepository {
  create: (member: Prisma.MemberCreateInput) => Promise<Member>;

  update: (
    memberId: string,
    member: Prisma.MemberUpdateInput,
  ) => Promise<Member>;

  findById: (props: FindMemberByIdProps) => Promise<Member | null>;

  deleteUnique: (memberId: string) => Promise<Member>;
}
