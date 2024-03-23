import { Prisma, Room } from '@prisma/client';

export interface LocationProps {
  lat: number;
  lng: number;
  maxDistance: number;
}

export abstract class RoomsRepository {
  create: (Room: Prisma.RoomCreateInput) => Promise<Room>;

  totalCount: () => Promise<number>;

  update: (RoomId: string, Room: Prisma.RoomUpdateInput) => Promise<Room>;

  findById: (id: string, includeMembers?: boolean) => Promise<Room | null>;

  findByLocation: (props: LocationProps) => Promise<Room[] | null>;

  deleteUnique: (RoomId: string) => Promise<Room>;
}
