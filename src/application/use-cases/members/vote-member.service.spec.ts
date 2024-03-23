import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { MembersRepository } from '@/application/repositories/members.repository';
import { InMemoryMembersRepository } from '@/application/repositories/implementations/in-memory/members.repository';
import { StatusRoom } from '@prisma/client';
import { VoteMemberService } from './vote-member.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('Vote Member Use Case', () => {
  let sut: VoteMemberService;
  let roomsRepository: RoomsRepository;
  let membersRepository: MembersRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        VoteMemberService,
        { provide: RoomsRepository, useClass: InMemoryRoomsRepository },
        { provide: MembersRepository, useClass: InMemoryMembersRepository },
      ],
    }).compile();

    sut = moduleRef.get(VoteMemberService);
    roomsRepository = moduleRef.get(RoomsRepository);
    membersRepository = moduleRef.get(MembersRepository);
  });

  it('should be able to vote while in a room', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
    });

    await membersRepository.create({
      member: { connect: { id: 'user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    const { member } = await sut.execute({
      roomId: roomCreated.id,
      userId: 'user-id-test',
      vote: 'vote-test',
    });

    expect(member.member_id).toBe('user-id-test');
    expect(member.room_id).toBe(roomCreated.id);
    expect(member.vote).toBe('vote-test');
  });

  it('should be able to vote while in a room being the owner', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
    });

    await membersRepository.create({
      member: { connect: { id: 'user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    const { member } = await sut.execute({
      roomId: roomCreated.id,
      userId: 'user-id-test',
      vote: 'vote-test',
    });

    expect(member.member_id).toBe('user-id-test');
    expect(member.room_id).toBe(roomCreated.id);
    expect(member.vote).toBe('vote-test');
  });

  it('should not be able to vote if not in a room', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
    });

    const voteCreated = sut.execute({
      roomId: roomCreated.id,
      userId: 'other-id-test',
      vote: 'vote-test',
    });

    expect(voteCreated).rejects.toThrow(UnauthorizedException);
  });

  it('should not be able to vote in a non-existent room', async () => {
    const voteCreated = sut.execute({
      roomId: 'room-id-test',
      userId: 'other-id-test',
      vote: 'vote-test',
    });

    expect(voteCreated).rejects.toThrow(BadRequestException);
  });
});
