import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { DeleteUniqueRoomService } from './delete-unique-room.service';
import { StatusRoom } from '@prisma/client';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('Delete Unique Room Use Case', () => {
  let sut: DeleteUniqueRoomService;
  let roomsRepository: RoomsRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUniqueRoomService,
        { provide: RoomsRepository, useClass: InMemoryRoomsRepository },
      ],
    }).compile();

    sut = moduleRef.get(DeleteUniqueRoomService);
    roomsRepository = moduleRef.get(RoomsRepository);
  });

  it('should be able to delete room', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
    });

    const roomDeleted = await sut.execute({
      roomId: roomCreated.id,
      userId: 'id-test',
    });

    expect(roomDeleted.id).toEqual(roomCreated.id);

    const findRoomDeleted = await roomsRepository.findById(roomCreated.id);

    expect(findRoomDeleted).toBeNull();
  });

  it('should not be able to delete the room if user is not the owner', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
    });

    const roomDeleted = sut.execute({
      roomId: roomCreated.id,
      userId: 'other-id',
    });

    expect(roomDeleted).rejects.toThrow(UnauthorizedException);
  });

  it('should not be able to delete non-existent room', async () => {
    const roomDeleted = sut.execute({
      roomId: 'room-id-test',
      userId: 'user-id-test',
    });

    expect(roomDeleted).rejects.toThrow(BadRequestException);
  });
});
