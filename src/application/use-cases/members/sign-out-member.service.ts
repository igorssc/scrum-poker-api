import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MembersRepository } from '@/application/repositories/members.repository';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import {
  ROOM_NOT_FOUND,
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

    const userActionIsOwnerTheRoom = roomExists.owner_id !== data.userActionId;

    if (!userActionIsOwnerTheRoom) {
      const userActionIsInsideTheRoom =
        await this.membersRepository.findByMemberAndRoomId({
          memberId: data.memberId,
          roomId: data.roomId,
        });

      if (!userActionIsInsideTheRoom)
        throw new UnauthorizedException(USER_WITHOUT_PERMISSION);
    }

    await this.membersRepository.deleteUnique(data);
  }
}
