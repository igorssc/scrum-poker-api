import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Room, StatusMember, StatusRoom } from '@prisma/client';
import { USER_NOT_FOUND } from '@/application/errors/errors.constants';
import { MembersRepository } from '@/application/repositories/members.repository';
import { capitalizeInitials } from '@/application/utils/capitalize-initials';
import { UsersRepository } from '@/application/repositories/users.repository';

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
  theme: string;
}

@Injectable()
export class CreateRoomService {
  constructor(
    private roomsRepository: RoomsRepository,
    private usersRepository: UsersRepository,
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
      const userCreated = await this.usersRepository.create({
        name: capitalizeInitials(data.userName),
      });

      userId = userCreated.id;
    }

    const roomCreated = await this.roomsRepository.create({
      name: capitalizeInitials(data.name),
      owner: { connect: { id: userId } },
      status: StatusRoom.OPEN,
      lat: data.lat,
      lng: data.lng,
      private: !!data.private,
      theme: data.theme,
    });

    await this.membersRepository.create({
      member: { connect: { id: userId } },
      room: { connect: { id: roomCreated.id } },
      status: StatusMember.LOGGED
    });

    return { room: roomCreated };
  }
}
