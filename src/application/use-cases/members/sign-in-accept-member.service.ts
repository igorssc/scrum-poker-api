import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MembersRepository } from '@/application/repositories/members.repository';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import {
  ACCESS_ROOM_INVALID,
  OWNER_ID_ROOM_INVALID,
  ROOM_NOT_FOUND,
  USER_IS_ALREADY_IN_THE_ROOM,
} from '@/application/errors/errors.constants';

interface SignInAcceptMemberServiceExecuteProps {
  userId: string;
  roomId: string;
  ownerId: string;
  access: string;
}

@Injectable()
export class SignInAcceptMemberService {
  constructor(
    private membersRepository: MembersRepository,
    private roomsRepository: RoomsRepository,
  ) {}

  async execute(data: SignInAcceptMemberServiceExecuteProps) {
    const roomExists = await this.roomsRepository.findById(data.roomId);

    if (!roomExists) throw new BadRequestException(ROOM_NOT_FOUND);

    const userActionIsInsideTheRoom =
      await this.membersRepository.findByMemberAndRoomId({
        memberId: data.userId,
        roomId: data.roomId,
      });

    if (userActionIsInsideTheRoom) {
      throw new UnauthorizedException(USER_IS_ALREADY_IN_THE_ROOM);
    }

    if (roomExists.access !== data.access) {
      throw new UnauthorizedException(ACCESS_ROOM_INVALID);
    }

    if (roomExists.owner_id !== data.ownerId) {
      throw new UnauthorizedException(OWNER_ID_ROOM_INVALID);
    }

    await this.membersRepository.create({
      member: { connect: { id: data.userId } },
      room: { connect: { id: data.roomId } },
    });
  }
}
