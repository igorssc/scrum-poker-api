import { PrismaService } from '@/application/providers/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, StatusRoom } from '@prisma/client';
import { LocationProps, RoomsRepository } from '../../rooms.repository';
import { calculateBoundingBox } from '@/application/utils/calculate-bounding-box';

@Injectable()
export class PrismaRoomsRepository implements RoomsRepository {
  constructor(private prisma: PrismaService) {}

  async create(room: Prisma.RoomCreateInput) {
    return await PrismaService.executeWithRetry(async () => {
      return await this.prisma.room.create({
        data: { ...room },
      });
    });
  }

  async findById(id: string, includeMembers = false, includeVotes = false) {
    return await PrismaService.executeWithRetry(async () => {
      const includeConfig: any = {};

      if (includeMembers) {
        includeConfig.members = {
          select: {
            member: { select: { name: true, id: true, created_at: true } },
            vote: true,
            status: true,
            created_at: true,
            last_activity: true,
            user_id: true,
            id: true,
          },
        };
      }

      if (includeVotes) {
        includeConfig.votes = {
          include: {
            voting_rounds: {
              include: {
                votes: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
              orderBy: {
                voted_at: 'asc',
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        };
      }

      const room = await this.prisma.room.findUnique({
        where: {
          id,
          status: StatusRoom.OPEN,
        },
        ...(Object.keys(includeConfig).length > 0 && {
          include: includeConfig,
        }),
      });

      return room;
    });
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
    return await PrismaService.executeWithRetry(async () => {
      return await this.prisma.room.count();
    });
  }

  async findInactiveRooms(lastActivityBefore: Date) {
    return await PrismaService.executeWithRetry(async () => {
      return await this.prisma.room.findMany({
        where: {
          status: StatusRoom.OPEN,
          last_activity: {
            lt: lastActivityBefore,
          },
        },
      });
    });
  }

  async update(roomId: string, room: Prisma.RoomUpdateInput) {
    return await PrismaService.executeWithRetry(async () => {
      return await this.prisma.room.update({
        where: {
          id: roomId,
        },
        data: room,
      });
    });
  }

  async deleteUnique(roomId: string) {
    return await PrismaService.executeWithRetry(async () => {
      return await this.prisma.room.delete({ where: { id: roomId } });
    });
  }
}
