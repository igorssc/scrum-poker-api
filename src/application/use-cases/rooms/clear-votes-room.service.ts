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

export interface ClearVotesRoomUseCaseResponse {
  member: Member;
}

interface ClearVotesRoomServiceExecuteProps {
  userId: string;
  roomId: string;
}

@Injectable()
export class ClearVotesRoomService {
  constructor(
    private roomsRepository: RoomsRepository,
    private membersRepository: MembersRepository,
  ) {}

  async execute(data: ClearVotesRoomServiceExecuteProps): Promise<void> {
    const roomsExists = await this.roomsRepository.findById(data.roomId);

    if (!roomsExists) throw new BadRequestException(ROOM_NOT_FOUND);

    const userActionIsOwnerTheRoom = roomsExists.owner_id !== data.userId;

    if (!userActionIsOwnerTheRoom) {
      const userActionIsInsideTheRoom =
        await this.membersRepository.findByMemberAndRoomId({
          memberId: data.userId,
          roomId: data.roomId,
        });

      if (!userActionIsInsideTheRoom)
        throw new UnauthorizedException(USER_WITHOUT_PERMISSION);
    }

    await this.membersRepository.update(
      {
        roomId: data.roomId,
      },
      { vote: null },
    );
  }
}
