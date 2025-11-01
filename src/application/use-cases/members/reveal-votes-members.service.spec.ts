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

  it('should reveal cards when user is room owner (owner always in who_can_open_cards)', async () => {
    const room = await roomsRepository.create({
      name: 'Sala Teste',
      owner: { connect: { id: 'owner-1' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'default',
    });

    const result = await sut.execute({
      roomId: room.id,
      userId: 'owner-1'
    });

    expect(result.room.cards_open).toBe(true);
  });

  it('should reveal cards when user is in who_can_open_cards list', async () => {
    const room = await roomsRepository.create({
      name: 'Sala Teste',
      owner: { connect: { id: 'owner-1' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'default',
    });

    await roomsRepository.update(room.id, {
      who_can_open_cards: ['owner-1', 'member-1']
    });

    await membersRepository.create({
      member: { connect: { id: 'member-1' } },
      room: { connect: { id: room.id } },
    });

    const result = await sut.execute({
      roomId: room.id,
      userId: 'member-1'
    });

    expect(result.room.cards_open).toBe(true);
  });

  it('should throw UnauthorizedException if user is not in who_can_open_cards list', async () => {
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

    await expect(sut.execute({
      roomId: room.id,
      userId: 'member-1'
    })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw UnauthorizedException if user is not member of the room', async () => {
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

  it('should allow multiple users in who_can_open_cards to reveal votes', async () => {
    const room = await roomsRepository.create({
      name: 'Sala Teste',
      owner: { connect: { id: 'owner-1' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'default',
    });

    await roomsRepository.update(room.id, {
      who_can_open_cards: ['owner-1', 'member-1', 'member-2', 'member-3']
    });

    await membersRepository.create({
      member: { connect: { id: 'member-2' } },
      room: { connect: { id: room.id } },
    });

    const result = await sut.execute({
      roomId: room.id,
      userId: 'member-2'
    });

    expect(result.room.cards_open).toBe(true);
  });

  it('should work when room has cards already open', async () => {
    const room = await roomsRepository.create({
      name: 'Sala Teste',
      owner: { connect: { id: 'owner-1' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'default',
    });

    await roomsRepository.update(room.id, {
      cards_open: true
    });

    const result = await sut.execute({
      roomId: room.id,
      userId: 'owner-1'
    });

    expect(result.room.cards_open).toBe(true);
  });

  it('should validate permissions before checking if user is in room', async () => {
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
      userId: 'outsider-user'
    })).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
