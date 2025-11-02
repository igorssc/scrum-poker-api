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
      start_timer: startTimer,
      stop_timer: stopTimer,
      auto_grant_permissions: autoGrantPermissions,
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

    const hasPermissionChanges =
      who_can_edit || who_can_open_cards || who_can_aprove_entries;
    const hasTimerChanges = startTimer !== undefined || stopTimer !== undefined;
    const hasOwnerOnlyChanges = autoGrantPermissions !== undefined;
    const hasRegularUpdates =
      name ||
      lat !== undefined ||
      lng !== undefined ||
      privateRoom !== undefined ||
      theme;

    const userCanEditRoom =
      userIsRoomOwner || roomExists.who_can_edit.includes(userId);
    const userCanModifyTimer =
      userIsRoomOwner || roomExists.who_can_open_cards.includes(userId);

    if (hasPermissionChanges && !userIsRoomOwner) {
      throw new UnauthorizedException(USER_WITHOUT_PERMISSION);
    }

    if (hasOwnerOnlyChanges && !userIsRoomOwner) {
      throw new UnauthorizedException(USER_WITHOUT_PERMISSION);
    }

    if (hasTimerChanges && !userCanModifyTimer) {
      throw new UnauthorizedException(USER_WITHOUT_PERMISSION);
    }

    if (hasRegularUpdates && !userCanEditRoom) {
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

    let finalWhoCanEdit = who_can_edit;
    let finalWhoCanOpenCards = who_can_open_cards;
    let finalWhoCanAproveEntries = who_can_aprove_entries;

    if (autoGrantPermissions === true) {
      const allMembers = await this.membersRepository.findAllByRoomId(roomId);
      const allMemberIds = allMembers.map((member) => member.user_id);

      const allUsersWithOwner = [...new Set([...allMemberIds, roomOwnerId])];

      finalWhoCanEdit = who_can_edit
        ? [...new Set([...who_can_edit, ...allUsersWithOwner])]
        : allUsersWithOwner;
      finalWhoCanOpenCards = who_can_open_cards
        ? [...new Set([...who_can_open_cards, ...allUsersWithOwner])]
        : allUsersWithOwner;
      finalWhoCanAproveEntries = who_can_aprove_entries
        ? [...new Set([...who_can_aprove_entries, ...allUsersWithOwner])]
        : allUsersWithOwner;
    }

    const roomUpdated = await this.roomsRepository.update(roomId, {
      name: capitalizeInitials(name),
      lat,
      lng,
      theme,
      private: privateRoom,
      ...(finalWhoCanEdit && { who_can_edit: [...new Set(finalWhoCanEdit)] }),
      ...(finalWhoCanOpenCards && {
        who_can_open_cards: [...new Set(finalWhoCanOpenCards)],
      }),
      ...(finalWhoCanAproveEntries && {
        who_can_aprove_entries: [...new Set(finalWhoCanAproveEntries)],
      }),
      ...(startTimer !== undefined && { start_timer: startTimer }),
      ...(stopTimer !== undefined && { stop_timer: stopTimer }),
      ...(autoGrantPermissions !== undefined && {
        auto_grant_permissions: autoGrantPermissions,
      }),
    });

    return { room: roomUpdated };
  }
}
