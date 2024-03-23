import {
  BadRequestException,
  Injectable,
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
  memberId: string;
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

    if (!roomExists) throw new BadRequestException(ROOM_NOT_FOUND);

    const userActionIsOwnerTheRoom = roomExists.owner_id === data.userActionId;

    const userActionIsEqualUserSignOut = data.memberId === data.userActionId;

    if (!userActionIsOwnerTheRoom && !userActionIsEqualUserSignOut) {
      throw new UnauthorizedException(USER_WITHOUT_PERMISSION);
    }

    if (!userActionIsEqualUserSignOut) {
      const userIsInsideTheRoom =
        await this.membersRepository.findByMemberAndRoomId({
          memberId: data.memberId,
          roomId: data.roomId,
        });

      if (!userIsInsideTheRoom) {
        throw new BadRequestException(USER_IS_NOT_IN_THE_ROOM);
      }
    }

    await this.membersRepository.deleteUnique(data);
  }
}
