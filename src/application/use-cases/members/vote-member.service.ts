import { RoomsRepository } from '@/application/repositories/rooms.repository';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
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

    if (!roomExists) throw new NotFoundException(ROOM_NOT_FOUND);

    const userActionIsOwnerTheRoom = roomExists.owner_id === data.userId;

    if (!userActionIsOwnerTheRoom) {
      const userActionIsInsideTheRoom =
        await this.membersRepository.findByUserAndRoomId({
          userId: data.userId,
          roomId: data.roomId,
        });

      if (!userActionIsInsideTheRoom)
        throw new UnauthorizedException(USER_IS_NOT_IN_THE_ROOM);
    }

    await this.membersRepository.update(
      {
        userId: data.userId,
        roomId: data.roomId,
      },
      { vote: data.vote },
    );

    const memberFound = await this.membersRepository.findByUserAndRoomId(
      {
        roomId: data.roomId,
        userId: data.userId,
      },
      true,
    );

    return { member: memberFound };
  }
}
