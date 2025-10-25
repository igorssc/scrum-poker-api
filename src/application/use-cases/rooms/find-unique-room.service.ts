import { INVALID_PARAMS, ROOM_NOT_FOUND } from '@/application/errors/errors.constants';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Room } from '@prisma/client';
import { isUUID } from 'class-validator';

interface FindUniqueRoomUseCaseResponse {
  room: Room;
}

@Injectable()
export class FindUniqueRoomService {
  constructor(private roomsRepository: RoomsRepository) {}

  async execute(query: string): Promise<FindUniqueRoomUseCaseResponse> {
    if (!isUUID(query)) {
      throw new BadRequestException(INVALID_PARAMS);
    }

    const room = await this.roomsRepository.findById(query, true);

    if(!room) {
      throw new BadRequestException(ROOM_NOT_FOUND);
    }

    return { room };
  }
}
