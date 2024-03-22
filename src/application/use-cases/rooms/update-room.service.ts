import {
  ROOM_NOT_FOUND,
  USER_IS_NOT_IN_THE_ROOM,
} from '@/application/errors/errors.constants';
import { MembersRepository } from '@/application/repositories/members.repository';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { capitalizeInitials } from '@/application/utils/capitalize-initials';
import { UpdateRoomDto } from '@/infra/dtos/rooms/update-room.dto';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Room } from '@prisma/client';

interface UpdateRoomUseCaseResponse {
  room: Room;
}

interface UpdateRoomServiceExecuteProps {
  roomId: string;
  userId: string;
}

@Injectable()
export class UpdateRoomService {
  constructor(
    private roomsRepository: RoomsRepository,
    private membersRepository: MembersRepository,
  ) {}

  async execute(
    props: UpdateRoomServiceExecuteProps,
    data: UpdateRoomDto,
  ): Promise<UpdateRoomUseCaseResponse> {
    const { name, lat, lng, private: privateRoom } = data;
    const { roomId, userId } = props;

    const roomExists = await this.roomsRepository.findById(roomId);

    if (!roomExists) throw new BadRequestException(ROOM_NOT_FOUND);

    const isUserInTheRoom = await this.membersRepository.findByMemberAndRoomId({
      memberId: userId,
      roomId,
    });

    if (!isUserInTheRoom)
      throw new UnauthorizedException(USER_IS_NOT_IN_THE_ROOM);

    const roomUpdated = await this.roomsRepository.update(roomId, {
      name: capitalizeInitials(name),
      lat,
      lng,
      private: privateRoom,
    });

    return { room: roomUpdated };
  }
}
