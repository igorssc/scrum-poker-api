import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { CreateRoomDto } from '@/infra/dtos/rooms/create-room.dto';
import { Injectable } from '@nestjs/common';
import { Room, StatusRoom } from '@prisma/client';
import { CreateUserService } from '../users/create-user.service';

export interface CreateRoomUseCaseResponse {
  room: Room;
}

@Injectable()
export class CreateRoomService {
  constructor(
    private roomsRepository: RoomsRepository,
    private createUserService: CreateUserService,
  ) {}

  async execute(data: CreateRoomDto): Promise<CreateRoomUseCaseResponse> {
    let userId = data.user_id;

    if (!data.user_id) {
      const userCreated = await this.createUserService.execute({
        name: data.user_name,
      });

      userId = userCreated.user.id;
    }

    const roomCreated = await this.roomsRepository.create({
      name: data.name,
      owner: { connect: { id: userId } },
      status: StatusRoom.OPEN,
      lat: data.lat,
      lng: data.lng,
    });

    return { room: roomCreated };
  }
}
