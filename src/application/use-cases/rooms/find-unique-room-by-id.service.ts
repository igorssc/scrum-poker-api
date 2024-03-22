import { INVALID_PARAMS } from '@/application/errors/errors.constants';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Room } from '@prisma/client';
import { isUUID } from 'class-validator';

interface FindUniqueRoomByIdUseCaseResponse {
  room: Room;
}

@Injectable()
export class FindUniqueRoomByIdService {
  constructor(private roomsRepository: RoomsRepository) {}

  async execute(query: string): Promise<FindUniqueRoomByIdUseCaseResponse> {
    if (isUUID(query)) {
      const room = await this.roomsRepository.findById(query);

      return { room };
    }

    throw new BadRequestException(INVALID_PARAMS);
  }
}
