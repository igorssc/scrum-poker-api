import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { CreateRoomDto } from '@/infra/dtos/rooms/create-room.dto';
import { Injectable } from '@nestjs/common';
import { Room, StatusRoom } from '@prisma/client';

interface CreateRoomUseCaseResponse {
  room: Room;
}

@Injectable()
export class CreateRoomService {
  constructor(private roomsRepository: RoomsRepository) {}

  async execute(data: CreateRoomDto): Promise<CreateRoomUseCaseResponse> {
    const roomCreated = await this.roomsRepository.create({
      name: data.name,
      owner: { connect: { id: data.user_id } },
      status: StatusRoom.OPEN,
      lat: data.lat,
      lng: data.lng,
    });

    return { room: roomCreated };
  }
}
