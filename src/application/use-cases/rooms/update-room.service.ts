import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { capitalizeInitials } from '@/application/utils/capitalize-initials';
import { UpdateRoomDto } from '@/infra/dtos/rooms/update-room.dto';
import { Injectable } from '@nestjs/common';
import { Room } from '@prisma/client';

interface UpdateRoomUseCaseResponse {
  room: Room;
}

@Injectable()
export class UpdateRoomService {
  constructor(private roomsRepository: RoomsRepository) {}

  async execute(
    roomId: string,
    data: UpdateRoomDto,
  ): Promise<UpdateRoomUseCaseResponse> {
    const { name, lat, lng } = data;

    const roomUpdated = await this.roomsRepository.update(roomId, {
      name: capitalizeInitials(name),
      lat,
      lng,
    });

    return { room: roomUpdated };
  }
}
