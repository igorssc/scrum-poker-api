import { Injectable } from '@nestjs/common';
import { Prisma, Room, StatusRoom } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { LocationProps, RoomsRepository } from '../../rooms.repository';
import { calculateBoundingBox } from '@/application/utils/calculate-bounding-box';

@Injectable()
export class InMemoryRoomsRepository implements RoomsRepository {
  public items: Room[] = [];

  async create(data: Prisma.RoomCreateInput) {
    const roomCreated = {
      id: randomUUID(),
      name: data.name,
      owner_id: data.owner.connect.id,
      created_at: new Date(),
      status: StatusRoom.OPEN,
      lat: data.lat,
      lng: data.lng,
      private: data.private,
    };

    this.items.push(roomCreated);

    return roomCreated;
  }

  async findById(id: string) {
    const room = this.items.find(
      (item) => item.id === id && item.status === StatusRoom.OPEN,
    );

    if (!room) {
      return null;
    }

    return { ...room };
  }

  async findByLocation({ lat, lng, maxDistance }: LocationProps) {
    const { minLat, maxLat, minLng, maxLng } = calculateBoundingBox({
      lat,
      lng,
      maxDistance,
    });

    const room = this.items.filter(
      (item) =>
        item.lat >= minLat &&
        item.lat <= maxLat &&
        item.lng >= minLng &&
        item.lng <= maxLng &&
        item.status === StatusRoom.OPEN,
    );

    return room;
  }

  async totalCount() {
    return this.items.length;
  }

  async update(roomId: string, room: Prisma.RoomUpdateInput) {
    const roomIndex = this.items.findIndex((item) => item.id === roomId);

    if (roomIndex < 0) {
      return null;
    }

    Object.assign(this.items[roomIndex], room);

    return { ...this.items[roomIndex] };
  }

  async deleteUnique(roomId: string) {
    const roomIndex = this.items.findIndex((item) => item.id === roomId);

    if (roomIndex < 0) {
      return null;
    }

    const roomDeleted = { ...this.items[roomIndex] };

    this.items.splice(roomIndex, 1);

    return roomDeleted;
  }
}
