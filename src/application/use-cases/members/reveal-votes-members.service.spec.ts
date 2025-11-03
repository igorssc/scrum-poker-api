import { describe, it, expect, beforeEach } from 'vitest';
import { RevealVotesMembersService } from './reveal-votes-members.service';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { MembersRepository } from '@/application/repositories/members.repository';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { InMemoryMembersRepository } from '@/application/repositories/implementations/in-memory/members.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { StatusRoom } from '@prisma/client';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { VotesRepository } from '@/application/repositories/votes.repository';
import { VotingRoundsRepository } from '@/application/repositories/voting-rounds.repository';
import { VoteDetailsRepository } from '@/application/repositories/vote-details.repository';
import { InMemoryVotesRepository } from '@/application/repositories/implementations/in-memory/votes.repository';
import { InMemoryVotingRoundsRepository } from '@/application/repositories/implementations/in-memory/voting-rounds.repository';
import { InMemoryVoteDetailsRepository } from '@/application/repositories/implementations/in-memory/vote-details.repository';

describe('RevealVotesMembersService', () => {
  let sut: RevealVotesMembersService;
  let roomsRepository: InMemoryRoomsRepository;
  let membersRepository: InMemoryMembersRepository;
  let _votesRepository: InMemoryVotesRepository;
  let _votingRoundsRepository: InMemoryVotingRoundsRepository;
  let _voteDetailsRepository: InMemoryVoteDetailsRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RevealVotesMembersService,
        { provide: RoomsRepository, useClass: InMemoryRoomsRepository },
        { provide: MembersRepository, useClass: InMemoryMembersRepository },
        { provide: VotesRepository, useClass: InMemoryVotesRepository },
        {
          provide: VotingRoundsRepository,
          useClass: InMemoryVotingRoundsRepository,
        },
        {
          provide: VoteDetailsRepository,
          useClass: InMemoryVoteDetailsRepository,
        },
      ],
    }).compile();

    sut = moduleRef.get(RevealVotesMembersService);
    roomsRepository = moduleRef.get(RoomsRepository);
    membersRepository = moduleRef.get(MembersRepository);
    _votesRepository = moduleRef.get(VotesRepository);
    _votingRoundsRepository = moduleRef.get(VotingRoundsRepository);
    _voteDetailsRepository = moduleRef.get(VoteDetailsRepository);
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
      userId: 'owner-1',
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
      who_can_open_cards: ['owner-1', 'member-1'],
    });

    await membersRepository.create({
      member: { connect: { id: 'member-1' } },
      room: { connect: { id: room.id } },
    });

    const result = await sut.execute({
      roomId: room.id,
      userId: 'member-1',
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

    await expect(
      sut.execute({
        roomId: room.id,
        userId: 'member-1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
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

    await expect(
      sut.execute({
        roomId: room.id,
        userId: 'unauthorized-user',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw NotFoundException if room not found', async () => {
    await expect(
      sut.execute({
        roomId: 'non-existent-room',
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
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
      who_can_open_cards: ['owner-1', 'member-1', 'member-2', 'member-3'],
    });

    await membersRepository.create({
      member: { connect: { id: 'member-2' } },
      room: { connect: { id: room.id } },
    });

    const result = await sut.execute({
      roomId: room.id,
      userId: 'member-2',
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
      cards_open: true,
    });

    const result = await sut.execute({
      roomId: room.id,
      userId: 'owner-1',
    });

    expect(result.room.cards_open).toBe(true);
  });

  it('should validate permissions before checking if user is in room', async () => {
    const room = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
      who_can_open_cards: [],
    });

    await expect(
      sut.execute({
        roomId: room.id,
        userId: 'user-id-test',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should save voting data when revealing cards with votes', async () => {
    const startTime = new Date(Date.now() - 300000);
    const stopTime = new Date();

    const room = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
      who_can_open_cards: ['owner-id-test'],
      current_issue: 'Test Feature',
      current_sector: 'Backend',
      start_timer: startTime,
      stop_timer: stopTime,
    });

    await membersRepository.create({
      member: { connect: { id: 'member1-id' } },
      room: { connect: { id: room.id } },
      vote: 'nature/8.svg',
    });

    await membersRepository.create({
      member: { connect: { id: 'member2-id' } },
      room: { connect: { id: room.id } },
      vote: 'nature/5.svg',
    });

    const result = await sut.execute({
      roomId: room.id,
      userId: 'owner-id-test',
    });

    expect(result.room.cards_open).toBe(true);

    const vote = await _votesRepository.findByRoomAndTopic(
      room.id,
      'Test Feature',
    );
    expect(vote).toBeTruthy();
    expect(vote?.topic).toBe('Test Feature');
    expect(vote?.sector).toBe('Backend');
  });

  it('should only save votes with numeric values below 50', async () => {
    const startTime = new Date(Date.now() - 300000);
    const stopTime = new Date();

    const room = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
      who_can_open_cards: ['owner-id-test'],
      current_issue: 'Test Feature',
      current_sector: 'Backend',
      start_timer: startTime,
      stop_timer: stopTime,
    });

    await membersRepository.create({
      member: { connect: { id: 'member1-id' } },
      room: { connect: { id: room.id } },
      vote: 'nature/8.svg',
    });

    await membersRepository.create({
      member: { connect: { id: 'member2-id' } },
      room: { connect: { id: room.id } },
      vote: 'nature/100.svg',
    });

    await membersRepository.create({
      member: { connect: { id: 'member3-id' } },
      room: { connect: { id: room.id } },
      vote: 'XL',
    });

    await membersRepository.create({
      member: { connect: { id: 'member4-id' } },
      room: { connect: { id: room.id } },
      vote: 'nature/13.svg',
    });

    const result = await sut.execute({
      roomId: room.id,
      userId: 'owner-id-test',
    });

    expect(result.room.cards_open).toBe(true);

    const vote = await _votesRepository.findByRoomAndTopic(
      room.id,
      'Test Feature',
    );
    expect(vote).toBeTruthy();

    expect(vote?.finalized_at).toBeTruthy();
    expect(vote?.total_duration).toBeTruthy();
    expect(vote?.total_duration).toBe(300);
  });
});
