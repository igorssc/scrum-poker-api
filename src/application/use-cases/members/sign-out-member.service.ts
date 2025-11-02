import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MembersRepository } from '@/application/repositories/members.repository';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import {
  ROOM_NOT_FOUND,
  USER_IS_NOT_IN_THE_ROOM,
  USER_WITHOUT_PERMISSION,
} from '@/application/errors/errors.constants';

interface SignOutMemberServiceExecuteProps {
  roomId: string;
  userId: string;
  userActionId: string;
}

@Injectable()
export class SignOutMemberService {
  constructor(
    private membersRepository: MembersRepository,
    private roomsRepository: RoomsRepository,
  ) {}

  async execute(data: SignOutMemberServiceExecuteProps) {
    const roomExists = await this.roomsRepository.findById(data.roomId);

    if (!roomExists) throw new NotFoundException(ROOM_NOT_FOUND);

    const userActionIsEqualUserSignOut = data.userId === data.userActionId;

    const userCanPerformAction = roomExists.who_can_aprove_entries.includes(
      data.userActionId,
    );

    if (!userActionIsEqualUserSignOut && !userCanPerformAction) {
      throw new UnauthorizedException(USER_WITHOUT_PERMISSION);
    }

    if (!userActionIsEqualUserSignOut) {
      const userIsInsideTheRoom =
        await this.membersRepository.findByUserAndRoomId({
          userId: data.userId,
          roomId: data.roomId,
        });

      if (!userIsInsideTheRoom) {
        throw new BadRequestException(USER_IS_NOT_IN_THE_ROOM);
      }
    }

    const memberCanEditRoom = roomExists.who_can_edit.includes(data.userId);
    const memberCanOpenCards = roomExists.who_can_open_cards.includes(
      data.userId,
    );
    const memberCanAproveEntries = roomExists.who_can_aprove_entries.includes(
      data.userId,
    );

    if (memberCanEditRoom || memberCanOpenCards || memberCanAproveEntries) {
      await this.roomsRepository.update(data.roomId, {
        who_can_edit: roomExists.who_can_edit.filter(
          (id) => id !== data.userId,
        ),
        who_can_open_cards: roomExists.who_can_open_cards.filter(
          (id) => id !== data.userId,
        ),
        who_can_aprove_entries: roomExists.who_can_aprove_entries.filter(
          (id) => id !== data.userId,
        ),
      });
    }

    await this.membersRepository.deleteUnique(data);
  }
}
