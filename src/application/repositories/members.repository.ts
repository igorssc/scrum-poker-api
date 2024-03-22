import { Prisma, Member } from '@prisma/client';

export interface FindMemberByIdProps {
  memberId: string;
  roomId: string;
}

export interface DeleteMemberProps {
  memberId: string;
  roomId: string;
}

export interface UpdateProps {
  memberId?: string;
  roomId: string;
}

export abstract class MembersRepository {
  create: (member: Prisma.MemberCreateInput) => Promise<Member>;

  update: (
    props: UpdateProps,
    member: Prisma.MemberUpdateInput,
  ) => Promise<Member>;

  findByMemberAndRoomId: (props: FindMemberByIdProps) => Promise<Member | null>;

  deleteUnique: (props: DeleteMemberProps) => Promise<Member>;
}
