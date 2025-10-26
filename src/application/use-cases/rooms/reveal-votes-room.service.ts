import { Injectable, NotFoundException } from '@nestjs/common';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { ROOM_NOT_FOUND } from '@/application/errors/errors.constants';

@Injectable()
export class RevealVotesRoomService {
  constructor(private roomsRepository: RoomsRepository) {}

  async execute(roomId: string): Promise<{ room: any }> {
    const room = await this.roomsRepository.findById(roomId);
    
    if (!room) {
      throw new NotFoundException(ROOM_NOT_FOUND);
    }
    
    const updatedRoom = await this.roomsRepository.update(roomId, { status: 'OPEN' });
    
    return { room: updatedRoom };
  }
}
