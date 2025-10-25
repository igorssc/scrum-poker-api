import {
  ROOM_NOT_FOUND,
  USER_WITHOUT_PERMISSION,
} from '@/application/errors/errors.constants';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Room, StatusRoom } from '@prisma/client';

interface DeleteUniqueRoomServiceExecuteProps {
  roomId: string;
  userId: string;
}

@Injectable()
export class DeleteUniqueRoomService {
  constructor(private roomsRepository: RoomsRepository) {}

  async execute({
    roomId,
    userId,
  }: DeleteUniqueRoomServiceExecuteProps): Promise<Room> {
    const roomExists = await this.roomsRepository.findById(roomId);

    if (!roomExists) throw new NotFoundException(ROOM_NOT_FOUND);

    const userActionIsOwnerTheRoom = roomExists.owner_id === userId;

    if (!userActionIsOwnerTheRoom)
      throw new UnauthorizedException(USER_WITHOUT_PERMISSION);

    return await this.roomsRepository.update(roomId, {
      status: StatusRoom.CLOSED,
    });
  }
}
