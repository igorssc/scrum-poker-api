import { PrismaService } from '@/application/providers/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, StatusRoom } from '@prisma/client';
import { LocationProps, RoomsRepository } from '../../rooms.repository';
import { calculateBoundingBox } from '@/application/utils/calculate-bounding-box';

@Injectable()
export class PrismaRoomsRepository implements RoomsRepository {
  constructor(private prisma: PrismaService) {}

  async create(room: Prisma.RoomCreateInput) {
    const roomCreated = await this.prisma.room.create({
      data: { ...room },
    });

    return roomCreated;
  }

  async findById(id: string) {
    const room = await this.prisma.room.findUnique({
      where: {
        id,
        status: StatusRoom.OPEN,
      },
    });

    return room;
  }

  async findByLocation({ lat, lng, maxDistance }: LocationProps) {
    const { minLat, maxLat, minLng, maxLng } = calculateBoundingBox({
      lat,
      lng,
      maxDistance,
    });

    const room = await this.prisma.room.findMany({
      where: {
        lat: {
          gte: minLat,
          lte: maxLat,
        },
        lng: {
          gte: minLng,
          lte: maxLng,
        },
        status: StatusRoom.OPEN,
      },
    });

    return room;
  }

  async totalCount() {
    return await this.prisma.room.count();
  }

  async update(roomId: string, room: Prisma.RoomUpdateInput) {
    const data = await this.prisma.room.update({
      where: {
        id: roomId,
      },
      data: room,
    });

    return data;
  }

  async deleteUnique(roomId: string) {
    return await this.prisma.room.delete({ where: { id: roomId } });
  }
}
