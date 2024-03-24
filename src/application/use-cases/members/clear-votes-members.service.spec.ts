import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { MembersRepository } from '@/application/repositories/members.repository';
import { InMemoryMembersRepository } from '@/application/repositories/implementations/in-memory/members.repository';
import { StatusRoom } from '@prisma/client';
import { ClearVotesMembersService } from './clear-votes-members.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

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

  it('should be able to clear votes while in a room', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    await membersRepository.create({
      member: { connect: { id: 'first-user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    await membersRepository.create({
      member: { connect: { id: 'second-user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    await membersRepository.create({
      member: { connect: { id: 'third-user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    await sut.execute({
      roomId: roomCreated.id,
      userId: 'first-user-id-test',
    });

    const firstUser = await membersRepository.findByUserAndRoomId({
      userId: 'first-user-id-test',
      roomId: roomCreated.id,
    });

    expect(firstUser.user_id).toBe('first-user-id-test');
    expect(firstUser.vote).toBeNull();

    const secondUser = await membersRepository.findByUserAndRoomId({
      userId: 'second-user-id-test',
      roomId: roomCreated.id,
    });

    expect(secondUser.user_id).toBe('second-user-id-test');
    expect(secondUser.vote).toBeNull();

    const thirdUser = await membersRepository.findByUserAndRoomId({
      userId: 'third-user-id-test',
      roomId: roomCreated.id,
    });

    expect(thirdUser.user_id).toBe('third-user-id-test');
    expect(thirdUser.vote).toBeNull();
  });

  it('should be able to clear votes while in a room being owned', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    await membersRepository.create({
      member: { connect: { id: 'first-user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    await sut.execute({
      roomId: roomCreated.id,
      userId: 'user-id-test',
    });

    const firstUser = await membersRepository.findByUserAndRoomId({
      userId: 'first-user-id-test',
      roomId: roomCreated.id,
    });

    expect(firstUser.user_id).toBe('first-user-id-test');
    expect(firstUser.vote).toBeNull();
  });

  it('should not be able to clear votes while not being in a room', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    const cleanVotes = sut.execute({
      roomId: roomCreated.id,
      userId: 'other-id-test',
    });

    expect(cleanVotes).rejects.toThrow(UnauthorizedException);
  });

  it('should not be able to clear votes in a non-existent room', async () => {
    const cleanVotes = sut.execute({
      roomId: 'room-id-test',
      userId: 'other-id-test',
    });

    expect(cleanVotes).rejects.toThrow(BadRequestException);
  });
});
