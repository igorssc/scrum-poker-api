import { Injectable } from '@nestjs/common';
import { Prisma, Member, StatusMember } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import {
  DeleteMemberProps,
  FindMemberByIdProps,
  MembersRepository,
  UpdateProps,
} from '../../members.repository';

@Injectable()
export class InMemoryMembersRepository implements MembersRepository {
  public items: Member[] = [];

  async create(data: Prisma.MemberCreateInput) {
    const memberCreated = {
      id: randomUUID(),
      user_id: data.member.connect.id,
      room_id: data.room.connect.id,
      created_at: new Date(),
      vote: null,
      status: data.status || StatusMember.PENDING,
    };

    this.items.push(memberCreated);

    return memberCreated;
  }

  async findByUserAndRoomId(props: FindMemberByIdProps) {
    const member = this.items.find(
      (item) => item.user_id === props.userId && item.room_id === props.roomId,
    );

    if (!member) {
      return null;
    }

    return { ...member };
  }

  async findAllByRoomId(roomId: string) {
    return this.items.filter((item) => item.room_id === roomId);
  }

  async totalCount() {
    return this.items.length;
  }

  async update(props: UpdateProps, member: Prisma.MemberUpdateInput) {
    if (props.userId) {
      const memberIndex = this.items.findIndex(
        (item) =>
          item.user_id === props.userId && item.room_id === props.roomId,
      );

      if (memberIndex < 0) {
        return null;
      }

      Object.assign(this.items[memberIndex], member);
      return { ...this.items[memberIndex] };
    } else {
      const membersToUpdate = this.items.filter(
        (item) => item.room_id === props.roomId,
      );

      if (membersToUpdate.length === 0) {
        return null;
      }

      membersToUpdate.forEach((memberItem) => {
        const memberIndex = this.items.findIndex(
          (item) => item.id === memberItem.id,
        );
        if (memberIndex >= 0) {
          Object.assign(this.items[memberIndex], member);
        }
      });

      return {
        ...this.items.find((item) => item.id === membersToUpdate[0].id),
      };
    }
  }

  async deleteUnique({ userId, roomId }: DeleteMemberProps) {
    const memberIndex = this.items.findIndex(
      (item) => item.user_id === userId && item.room_id === roomId,
    );

    if (memberIndex < 0) {
      return null;
    }

    const memberDeleted = { ...this.items[memberIndex] };

    this.items.splice(memberIndex, 1);

    return memberDeleted;
  }
}
