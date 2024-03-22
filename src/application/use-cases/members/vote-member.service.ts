import { RoomsRepository } from '@/application/repositories/rooms.repository';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Member } from '@prisma/client';
import {
  ROOM_NOT_FOUND,
  USER_WITHOUT_PERMISSION,
} from '@/application/errors/errors.constants';
import { MembersRepository } from '@/application/repositories/members.repository';

export interface VoteRoomUseCaseResponse {
  member: Member;
}

interface VoteRoomServiceExecuteProps {
  userId: string;
  roomId: string;
  vote: string;
}

@Injectable()
export class VoteRoomService {
  constructor(
    private roomsRepository: RoomsRepository,
    private membersRepository: MembersRepository,
  ) {}

  async execute(
    data: VoteRoomServiceExecuteProps,
  ): Promise<VoteRoomUseCaseResponse> {
    const roomExists = await this.roomsRepository.findById(data.roomId);

    if (!roomExists) throw new BadRequestException(ROOM_NOT_FOUND);

    const userActionIsOwnerTheRoom = roomExists.owner_id !== data.userId;

    if (!userActionIsOwnerTheRoom) {
      const userActionIsInsideTheRoom =
        await this.membersRepository.findByMemberAndRoomId({
          memberId: data.userId,
          roomId: data.roomId,
        });

      if (!userActionIsInsideTheRoom)
        throw new UnauthorizedException(USER_WITHOUT_PERMISSION);
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
