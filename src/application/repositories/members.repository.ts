import { Prisma, Member } from '@prisma/client';

export interface FindMemberByIdProps {
  userId: string;
  roomId: string;
}

export interface DeleteMemberProps {
  userId: string;
  roomId: string;
}

export interface UpdateProps {
  userId?: string;
  roomId: string;
}

export abstract class MembersRepository {
  create: (member: Prisma.MemberCreateInput) => Promise<Member>;

  update: (
    props: UpdateProps,
    member: Prisma.MemberUpdateInput,
  ) => Promise<Member>;

  findByUserAndRoomId: (
    props: FindMemberByIdProps,
    inclueUser?: boolean,
  ) => Promise<Member | null>;

  deleteUnique: (props: DeleteMemberProps) => Promise<Member>;
}
