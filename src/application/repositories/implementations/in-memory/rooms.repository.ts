import { Injectable } from '@nestjs/common';
import { Prisma, Room, StatusRoom } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { LocationProps, RoomsRepository } from '../../rooms.repository';
import { calculateBoundingBox } from '@/application/utils/calculate-bounding-box';

@Injectable()
export class InMemoryRoomsRepository implements RoomsRepository {
  public items: Room[] = [];

  async create(data: Prisma.RoomCreateInput) {
    const roomCreated: Room = {
      id: randomUUID(),
      name: data.name,
      owner_id: data.owner.connect.id,
      created_at: new Date(),
      status: StatusRoom.OPEN,
      lat: data.lat,
      lng: data.lng,
      private: data.private,
      access: randomUUID(),
      theme: data.theme,
      cards_open: false,
      start_timer: data.start_timer instanceof Date ? data.start_timer : null,
      stop_timer: data.stop_timer instanceof Date ? data.stop_timer : null,
      auto_grant_permissions: false,
      last_activity: new Date(),
      who_can_edit: Array.isArray(data.who_can_edit)
        ? data.who_can_edit
        : [data.owner.connect.id],
      who_can_open_cards: Array.isArray(data.who_can_open_cards)
        ? data.who_can_open_cards
        : [data.owner.connect.id],
      who_can_aprove_entries: Array.isArray(data.who_can_aprove_entries)
        ? data.who_can_aprove_entries
        : [data.owner.connect.id],
      current_issue: data.current_issue || null,
      current_sector: data.current_sector || null,
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

  async findInactiveRooms(lastActivityBefore: Date) {
    return this.items.filter(
      (item) =>
        item.status === StatusRoom.OPEN &&
        item.last_activity < lastActivityBefore,
    );
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
