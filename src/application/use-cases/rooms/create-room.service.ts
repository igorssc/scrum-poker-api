import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Room, StatusRoom } from '@prisma/client';
import { CreateUserService } from '../users/create-user.service';
import { USER_NOT_FOUND } from '@/application/errors/errors.constants';
import { MembersRepository } from '@/application/repositories/members.repository';

export interface CreateRoomUseCaseResponse {
  room: Room;
}

interface CreateRoomServiceExecuteProps {
  name: string;
  userId?: string;
  userName: string;
  lat?: number;
  lng?: number;
  private?: boolean;
}

@Injectable()
export class CreateRoomService {
  constructor(
    private roomsRepository: RoomsRepository,
    private createUserService: CreateUserService,
    private membersRepository: MembersRepository,
  ) {}

  async execute(
    data: CreateRoomServiceExecuteProps,
  ): Promise<CreateRoomUseCaseResponse> {
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

    const roomCreated = await this.roomsRepository.create({
      name: data.name,
      owner: { connect: { id: userId } },
      status: StatusRoom.OPEN,
      lat: data.lat,
      lng: data.lng,
      private: !!data.private,
    });

    await this.membersRepository.create({
      member: { connect: { id: userId } },
      room: { connect: { id: roomCreated.id } },
    });

    return { room: roomCreated };
  }
}
