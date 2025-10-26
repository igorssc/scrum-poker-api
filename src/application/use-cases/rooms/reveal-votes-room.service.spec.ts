import { describe, it, expect, beforeEach } from 'vitest';
import { RevealVotesRoomService } from './reveal-votes-room.service';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { StatusRoom, Room } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('RevealVotesRoomService', () => {
  let sut: RevealVotesRoomService;
  let roomsRepository: InMemoryRoomsRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RevealVotesRoomService,
        { provide: RoomsRepository, useClass: InMemoryRoomsRepository },
      ],
    }).compile();

    sut = moduleRef.get(RevealVotesRoomService);
    roomsRepository = moduleRef.get(RoomsRepository);
  });

  it('should reveal cards (set cards_open to true)', async () => {
    const room: Room = {
      id: 'room-1',
      name: 'Sala Teste',
      owner_id: 'owner-1',
      created_at: new Date(),
      theme: 'default',
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      access: 'access-1',
      cards_open: false,
    };

    roomsRepository.items.push(room);
    
    const originalFindById = roomsRepository.findById;
    roomsRepository.findById = async (id: string) => {
      const foundRoom = roomsRepository.items.find(item => item.id === id);
      return foundRoom ? { ...foundRoom } : null;
    };

    const result = await sut.execute('room-1');

    expect(result.room.cards_open).toBe(true);
    
    roomsRepository.findById = originalFindById;
  });

  it('should throw NotFoundException if room not found', async () => {
    await expect(sut.execute('non-existent-room')).rejects.toBeInstanceOf(NotFoundException);
  });
});
