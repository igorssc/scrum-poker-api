import { RoomsRepository } from '@/application/repositories/rooms.repository';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Member } from '@prisma/client';
import {
  ROOM_NOT_FOUND,
  USER_IS_NOT_IN_THE_ROOM,
} from '@/application/errors/errors.constants';
import { MembersRepository } from '@/application/repositories/members.repository';

export interface VoteMemberUseCaseResponse {
  member: Member;
}

interface VoteMemberServiceExecuteProps {
  userId: string;
  roomId: string;
  vote: string;
}

@Injectable()
export class VoteMemberService {
  constructor(
    private roomsRepository: RoomsRepository,
    private membersRepository: MembersRepository,
  ) {}

  async execute(
    data: VoteMemberServiceExecuteProps,
  ): Promise<VoteMemberUseCaseResponse> {
    const roomExists = await this.roomsRepository.findById(data.roomId);

    if (!roomExists) throw new BadRequestException(ROOM_NOT_FOUND);

    const userActionIsOwnerTheRoom = roomExists.owner_id === data.userId;

    if (!userActionIsOwnerTheRoom) {
      const userActionIsInsideTheRoom =
        await this.membersRepository.findByMemberAndRoomId({
          memberId: data.userId,
          roomId: data.roomId,
        });

      if (!userActionIsInsideTheRoom)
        throw new UnauthorizedException(USER_IS_NOT_IN_THE_ROOM);
    }

    const memberVoted = await this.membersRepository.update(
      {
        memberId: data.userId,
        roomId: data.roomId,
      },
      { vote: data.vote },
    );

    return { member: memberVoted };
  }
}
