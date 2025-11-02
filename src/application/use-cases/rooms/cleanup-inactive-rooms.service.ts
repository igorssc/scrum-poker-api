import { Injectable } from '@nestjs/common';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { StatusRoom } from '@prisma/client';

export interface CleanupInactiveRoomsResponse {
  closedRoomsCount: number;
  closedRoomIds: string[];
}

@Injectable()
export class CleanupInactiveRoomsService {
  constructor(private roomsRepository: RoomsRepository) {}

  async execute(): Promise<CleanupInactiveRoomsResponse> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const inactiveRooms =
      await this.roomsRepository.findInactiveRooms(sevenDaysAgo);

    const closedRoomIds: string[] = [];

    for (const room of inactiveRooms) {
      await this.roomsRepository.update(room.id, {
        status: StatusRoom.CLOSED,
      });
      closedRoomIds.push(room.id);
    }

    return {
      closedRoomsCount: closedRoomIds.length,
      closedRoomIds,
    };
  }
}
