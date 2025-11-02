import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import {
  ROOM_NOT_FOUND,
  USER_NOT_FOUND,
  USER_WITHOUT_PERMISSION,
} from '@/application/errors/errors.constants';
import { Member, Room } from '@prisma/client';
import { UsersRepository } from '@/application/repositories/users.repository';
import { MembersRepository } from '@/application/repositories/members.repository';

interface RevealVotesMembersServiceProps {
  roomId: string;
  userId: string;
}

@Injectable()
export class RevealVotesMembersService {
  constructor(
    private roomsRepository: RoomsRepository,
    private membersRepository: MembersRepository,
  ) {}

  async execute(data: RevealVotesMembersServiceProps): Promise<{ room: Room }> {
    const roomExists = await this.roomsRepository.findById(data.roomId);

    if (!roomExists) {
      throw new NotFoundException(ROOM_NOT_FOUND);
    }

    const userActionIsOwnerTheRoom = roomExists.owner_id === data.userId;

    if (!userActionIsOwnerTheRoom) {
      const userActionIsInsideTheRoom =
        await this.membersRepository.findByUserAndRoomId({
          userId: data.userId,
          roomId: data.roomId,
        });

      if (!userActionIsInsideTheRoom)
        throw new UnauthorizedException(USER_WITHOUT_PERMISSION);
    }

    const userCanOpenCards = roomExists.who_can_open_cards.includes(
      data.userId,
    );

    if (!userCanOpenCards) {
      throw new UnauthorizedException(USER_WITHOUT_PERMISSION);
    }

    const updatedRoom = await this.roomsRepository.update(data.roomId, {
      cards_open: true,
    });

    return { room: updatedRoom };
  }
}
