import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { StatusRoom } from '@prisma/client';
import { FindUniqueRoomService } from './find-unique-room.service';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

describe('Find Unique Room Use Case', () => {
  let sut: FindUniqueRoomService;
  let roomsRepository: RoomsRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindUniqueRoomService,
        { provide: RoomsRepository, useClass: InMemoryRoomsRepository },
      ],
    }).compile();

    sut = moduleRef.get(FindUniqueRoomService);
    roomsRepository = moduleRef.get(RoomsRepository);
  });

  it('should be able to find unique room', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
    });

    const { room: roomFound } = await sut.execute(roomCreated.id);

    expect(roomFound.id).toEqual(roomCreated.id);
    expect(roomFound.name).toEqual('0000 0000 0001');
  });

  it('should not be able to find a unique room non-existent', async () => {
    const { room: roomFound } = await sut.execute(randomUUID());

    expect(roomFound).toBeNull();
  });

  it('should not be able to find a unique room with an ID other than uuid', async () => {
    const roomFound = sut.execute('id-with-unknown-format');

    expect(roomFound).rejects.toThrow(BadRequestException);
  });
});
