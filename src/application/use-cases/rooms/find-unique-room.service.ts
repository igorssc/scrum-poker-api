import {
  INVALID_PARAMS,
  ROOM_NOT_FOUND,
} from '@/application/errors/errors.constants';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { MembersRepository } from '@/application/repositories/members.repository';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Room } from '@prisma/client';
import { isUUID } from 'class-validator';

type RoomWithMembers = Room & {
  members?: Array<{
    id: string;
    user_id: string;
    last_activity: Date;
    status: string;
    vote: string | null;
    created_at: Date;
    member: {
      id: string;
      name: string;
      created_at: Date;
    };
  }>;
};

interface FindUniqueRoomUseCaseResponse {
  room: RoomWithMembers;
}

@Injectable()
export class FindUniqueRoomService {
  constructor(
    private roomsRepository: RoomsRepository,
    private membersRepository: MembersRepository,
  ) {}

  async execute(query: string): Promise<FindUniqueRoomUseCaseResponse> {
    if (!isUUID(query)) {
      throw new BadRequestException(INVALID_PARAMS);
    }

    const room = (await this.roomsRepository.findById(
      query,
      true,
      true,
    )) as RoomWithMembers;

    if (!room) {
      throw new NotFoundException(ROOM_NOT_FOUND);
    }

    // Verificar e remover membros inativos há mais de 2 dias (exceto owner)
    if (room.members && room.members.length > 0) {
      const now = new Date();
      const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;

      const inactiveMembers = room.members.filter((member: any) => {
        // Não remove o owner
        if (member.user_id === room.owner_id) {
          return false;
        }

        // Verifica se está inativo há mais de 2 dias
        const lastActivity = new Date(member.last_activity);
        const timeDiff = now.getTime() - lastActivity.getTime();

        return timeDiff > twoDaysInMs;
      });

      // Remove membros inativos
      for (const inactiveMember of inactiveMembers) {
        await this.membersRepository.deleteUnique({
          userId: inactiveMember.user_id,
          roomId: room.id,
        });
      }

      // Atualiza a lista de membros no room removendo os inativos
      if (inactiveMembers.length > 0) {
        room.members = room.members.filter(
          (member: any) =>
            !inactiveMembers.some((inactive: any) => inactive.id === member.id),
        );
      }
    }

    return { room };
  }
}
