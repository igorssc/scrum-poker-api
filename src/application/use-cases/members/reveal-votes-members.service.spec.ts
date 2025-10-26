import { describe, it, expect, beforeEach } from 'vitest';
import { RevealVotesMembersService } from './reveal-votes-members.service';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { MembersRepository } from '@/application/repositories/members.repository';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { InMemoryMembersRepository } from '@/application/repositories/implementations/in-memory/members.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { StatusRoom, Room } from '@prisma/client';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('RevealVotesMembersService', () => {
  let sut: RevealVotesMembersService;
  let roomsRepository: InMemoryRoomsRepository;
  let membersRepository: InMemoryMembersRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RevealVotesMembersService,
        { provide: RoomsRepository, useClass: InMemoryRoomsRepository },
        { provide: MembersRepository, useClass: InMemoryMembersRepository },
      ],
    }).compile();

    sut = moduleRef.get(RevealVotesMembersService);
    roomsRepository = moduleRef.get(RoomsRepository);
    membersRepository = moduleRef.get(MembersRepository);
  });

  it('should reveal cards (set cards_open to true) when user is room owner', async () => {
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

    const result = await sut.execute({
      roomId: 'room-1',
      userId: 'owner-1'
    });

    expect(result.room.cards_open).toBe(true);
    
    roomsRepository.findById = originalFindById;
  });

  it('should reveal cards (set cards_open to true) when user is member of the room', async () => {
    const room = await roomsRepository.create({
      name: 'Sala Teste',
      owner: { connect: { id: 'owner-1' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'default',
    });

    await membersRepository.create({
      member: { connect: { id: 'member-1' } },
      room: { connect: { id: room.id } },
    });

    const result = await sut.execute({
      roomId: room.id,
      userId: 'member-1'
    });

    const updatedRoom = roomsRepository.items.find(r => r.id === room.id);
    expect(updatedRoom?.cards_open).toBe(true);
  });

  it('should throw UnauthorizedException if user is not owner and not member of the room', async () => {
    const room = await roomsRepository.create({
      name: 'Sala Teste',
      owner: { connect: { id: 'owner-1' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'default',
    });

    await expect(sut.execute({
      roomId: room.id,
      userId: 'unauthorized-user'
    })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw NotFoundException if room not found', async () => {
    await expect(sut.execute({
      roomId: 'non-existent-room',
      userId: 'user-1'
    })).rejects.toBeInstanceOf(NotFoundException);
  });
});
