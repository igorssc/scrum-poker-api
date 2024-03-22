import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MembersRepository } from '@/application/repositories/members.repository';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import {
  ACCESS_ROOM_INVALID,
  ROOM_NOT_FOUND,
  USER_IS_ALREADY_IN_THE_ROOM,
  USER_NOT_FOUND,
} from '@/application/errors/errors.constants';
import { CreateUserService } from '../users/create-user.service';

interface SignInMemberServiceExecuteProps {
  userId?: string;
  userName: string;
  roomId: string;
  access?: string;
}

@Injectable()
export class SignInMemberService {
  constructor(
    private createUserService: CreateUserService,
    private membersRepository: MembersRepository,
    private roomsRepository: RoomsRepository,
  ) {}

  async execute(data: SignInMemberServiceExecuteProps) {
    let userId = data.userId;

    if (data.userId) {
      const user = await this.roomsRepository.findById(userId);

      if (!user) throw new BadRequestException(USER_NOT_FOUND);
    }

    if (!data.userId) {
      const userCreated = await this.createUserService.execute({
        name: data.userName,
      });

      userId = userCreated.user.id;
    }

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

    if (data.access && roomExists.access !== data.access) {
      throw new UnauthorizedException(ACCESS_ROOM_INVALID);
    }

    if (!data.access) {
      // chamar websocket
    }

    await this.membersRepository.create({
      member: { connect: { id: data.userId } },
      room: { connect: { id: data.roomId } },
    });
  }
}