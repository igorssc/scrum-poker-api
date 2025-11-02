import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { MembersRepository } from '@/application/repositories/members.repository';
import { InMemoryMembersRepository } from '@/application/repositories/implementations/in-memory/members.repository';
import { StatusRoom } from '@prisma/client';
import { ClearVotesMembersService } from './clear-votes-members.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('Clear Votes Member Use Case', () => {
  let sut: ClearVotesMembersService;
  let roomsRepository: RoomsRepository;
  let membersRepository: MembersRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ClearVotesMembersService,
        { provide: RoomsRepository, useClass: InMemoryRoomsRepository },
        { provide: MembersRepository, useClass: InMemoryMembersRepository },
      ],
    }).compile();

    sut = moduleRef.get(ClearVotesMembersService);
    roomsRepository = moduleRef.get(RoomsRepository);
    membersRepository = moduleRef.get(MembersRepository);
  });

  it('should clear votes when user is in who_can_open_cards list', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    await roomsRepository.update(roomCreated.id, {
      who_can_open_cards: ['owner-id-test', 'member-1'],
      cards_open: true,
    });

    await membersRepository.create({
      member: { connect: { id: 'member-1' } },
      room: { connect: { id: roomCreated.id } },
    });

    await membersRepository.create({
      member: { connect: { id: 'member-2' } },
      room: { connect: { id: roomCreated.id } },
    });

    const result = await sut.execute({
      roomId: roomCreated.id,
      userId: 'member-1',
    });

    expect(result.room.cards_open).toBe(false);

    const member1 = await membersRepository.findByUserAndRoomId({
      userId: 'member-1',
      roomId: roomCreated.id,
    });
    expect(member1.vote).toBeNull();

    const member2 = await membersRepository.findByUserAndRoomId({
      userId: 'member-2',
      roomId: roomCreated.id,
    });
    expect(member2.vote).toBeNull();
  });

  it('should clear votes when user is room owner (owner always in who_can_open_cards)', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    await roomsRepository.update(roomCreated.id, {
      cards_open: true,
    });

    await membersRepository.create({
      member: { connect: { id: 'member-1' } },
      room: { connect: { id: roomCreated.id } },
    });

    const result = await sut.execute({
      roomId: roomCreated.id,
      userId: 'owner-id-test',
    });

    expect(result.room.cards_open).toBe(false);

    const member1 = await membersRepository.findByUserAndRoomId({
      userId: 'member-1',
      roomId: roomCreated.id,
    });
    expect(member1.vote).toBeNull();
  });

  it('should throw UnauthorizedException if user is not in who_can_open_cards list', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    await membersRepository.create({
      member: { connect: { id: 'member-1' } },
      room: { connect: { id: roomCreated.id } },
    });

    const cleanVotes = sut.execute({
      roomId: roomCreated.id,
      userId: 'member-1',
    });

    await expect(cleanVotes).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if user is not member of the room', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    const cleanVotes = sut.execute({
      roomId: roomCreated.id,
      userId: 'outsider-user',
    });

    await expect(cleanVotes).rejects.toThrow(UnauthorizedException);
  });

  it('should throw NotFoundException if room not found', async () => {
    const cleanVotes = sut.execute({
      roomId: 'non-existent-room',
      userId: 'user-id',
    });

    await expect(cleanVotes).rejects.toThrow(NotFoundException);
  });

  it('should allow multiple users in who_can_open_cards to clear votes', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    await roomsRepository.update(roomCreated.id, {
      who_can_open_cards: ['owner-id-test', 'member-1', 'member-2', 'member-3'],
      cards_open: true,
    });

    await membersRepository.create({
      member: { connect: { id: 'member-2' } },
      room: { connect: { id: roomCreated.id } },
    });

    const result = await sut.execute({
      roomId: roomCreated.id,
      userId: 'member-2',
    });

    expect(result.room.cards_open).toBe(false);
  });

  it('should work when room has cards already closed', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    await roomsRepository.update(roomCreated.id, {
      cards_open: false,
    });

    const result = await sut.execute({
      roomId: roomCreated.id,
      userId: 'owner-id-test',
    });

    expect(result.room.cards_open).toBe(false);
  });

  it('should clear all member votes regardless of who executes the action', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    await roomsRepository.update(roomCreated.id, {
      who_can_open_cards: ['owner-id-test', 'authorized-member'],
    });

    await membersRepository.create({
      member: { connect: { id: 'authorized-member' } },
      room: { connect: { id: roomCreated.id } },
    });

    await membersRepository.create({
      member: { connect: { id: 'regular-member' } },
      room: { connect: { id: roomCreated.id } },
    });

    await membersRepository.update(
      { roomId: roomCreated.id, userId: 'authorized-member' },
      { vote: '5' },
    );

    await membersRepository.update(
      { roomId: roomCreated.id, userId: 'regular-member' },
      { vote: '8' },
    );

    await sut.execute({
      roomId: roomCreated.id,
      userId: 'authorized-member',
    });

    const authorizedMember = await membersRepository.findByUserAndRoomId({
      userId: 'authorized-member',
      roomId: roomCreated.id,
    });
    expect(authorizedMember.vote).toBeNull();

    const regularMember = await membersRepository.findByUserAndRoomId({
      userId: 'regular-member',
      roomId: roomCreated.id,
    });
    expect(regularMember.vote).toBeNull();
  });
});
