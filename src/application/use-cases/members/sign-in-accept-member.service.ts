import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MembersRepository } from '@/application/repositories/members.repository';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import {
  ACCESS_ROOM_INVALID,
  OWNER_ID_ROOM_INVALID,
  ROOM_NOT_FOUND,
  USER_IS_ALREADY_IN_THE_ROOM,
  USER_IS_NOT_IN_THE_ROOM,
} from '@/application/errors/errors.constants';
import { StatusMember } from '@prisma/client';

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

    if (!roomExists) throw new NotFoundException(ROOM_NOT_FOUND);

    const userActionIsInsideTheRoom =
      await this.membersRepository.findByUserAndRoomId({
        userId: data.userId,
        roomId: data.roomId,
      });

    if (!userActionIsInsideTheRoom) {
      throw new BadRequestException(USER_IS_NOT_IN_THE_ROOM);
    }

    if (
      userActionIsInsideTheRoom &&
      userActionIsInsideTheRoom.status === StatusMember.LOGGED
    ) {
      throw new UnauthorizedException(USER_IS_ALREADY_IN_THE_ROOM);
    }

    if (roomExists.access !== data.access) {
      throw new UnauthorizedException(ACCESS_ROOM_INVALID);
    }

    if (roomExists.owner_id !== data.ownerId) {
      throw new UnauthorizedException(OWNER_ID_ROOM_INVALID);
    }

    await this.membersRepository.update(
      { roomId: data.roomId, userId: data.userId },
      {
        status: StatusMember.LOGGED,
      },
    );

    const memberLogged = await this.membersRepository.findByUserAndRoomId({
      userId: data.userId,
      roomId: data.roomId,
    });

    return { member: memberLogged };
  }
}
