import {
  ROOM_NOT_FOUND,
  USER_IS_NOT_IN_THE_ROOM,
  USER_WITHOUT_PERMISSION,
} from '@/application/errors/errors.constants';
import { MembersRepository } from '@/application/repositories/members.repository';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { capitalizeInitials } from '@/application/utils/capitalize-initials';
import { UpdateRoomDto } from '@/infra/dtos/rooms/update-room.dto';
import {
  Injectable,
  NotFoundException,
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
    const { 
      name, 
      lat, 
      lng, 
      private: privateRoom, 
      theme,
      who_can_edit,
      who_can_open_cards,
      who_can_aprove_entries,
    } = data;
    const { roomId, userId } = props;

    const roomExists = await this.roomsRepository.findById(roomId);

    if (!roomExists) throw new NotFoundException(ROOM_NOT_FOUND);

    const isUserInTheRoom = await this.membersRepository.findByUserAndRoomId({
      userId,
      roomId,
    });

    if (!isUserInTheRoom)
      throw new UnauthorizedException(USER_IS_NOT_IN_THE_ROOM);

    const roomOwnerId = roomExists.owner_id;

    const userIsRoomOwner = roomOwnerId === userId;

    const userCanPerformUpdate = userIsRoomOwner || roomExists.who_can_edit.includes(userId);

    if (!userCanPerformUpdate) {
      throw new UnauthorizedException(USER_WITHOUT_PERMISSION);
    }

    if (who_can_edit && who_can_edit.length > 0) {
      who_can_edit.push(roomOwnerId);
    }

    if (who_can_aprove_entries && who_can_aprove_entries.length > 0) {
      who_can_aprove_entries.push(roomOwnerId);
    }

    if (who_can_open_cards && who_can_open_cards.length > 0) {
      who_can_open_cards.push(roomOwnerId);
    }

    const roomUpdated = await this.roomsRepository.update(roomId, {
      name: capitalizeInitials(name),
      lat,
      lng,
      theme,
      private: privateRoom,
      ...(who_can_edit && {who_can_edit: [...new Set(who_can_edit)]}),
      ...(who_can_open_cards && {who_can_open_cards: [...new Set(who_can_open_cards)]}),
      ...(who_can_aprove_entries && {who_can_aprove_entries: [...new Set(who_can_aprove_entries)]}),
    });

    return { room: roomUpdated };
  }
}
