import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { FindRoomsByLocationDto } from '@/infra/dtos/rooms/find-rooms-by-location.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FindAllRoomsByLocationService {
  constructor(private roomsRepository: RoomsRepository) {}

  async execute({ lat, lng, max_distance = 100 }: FindRoomsByLocationDto) {
    const room = await this.roomsRepository.findByLocation({
      lat,
      lng,
      maxDistance: max_distance,
    });

    return room;
  }
}
