import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { MembersRepository } from '@/application/repositories/members.repository';
import { InMemoryMembersRepository } from '@/application/repositories/implementations/in-memory/members.repository';
import { StatusRoom } from '@prisma/client';
import { VoteMemberService } from './vote-member.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

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
      theme: 'theme-test',
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

    expect(member.user_id).toBe('user-id-test');
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
      theme: 'theme-test',
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

    expect(member.user_id).toBe('user-id-test');
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
      theme: 'theme-test',
    });

    const voteCreated = sut.execute({
      roomId: roomCreated.id,
      userId: 'other-id-test',
      vote: 'vote-test',
    });

    await expect(voteCreated).rejects.toThrow(UnauthorizedException);
  });

  it('should not be able to vote in a non-existent room', async () => {
    const voteCreated = sut.execute({
      roomId: 'room-id-test',
      userId: 'other-id-test',
      vote: 'vote-test',
    });

    await expect(voteCreated).rejects.toThrow(NotFoundException);
  });

  it('should update room last_activity when member votes', async () => {
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
      member: { connect: { id: 'user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    const initialRoomData = await roomsRepository.findById(roomCreated.id);
    const initialLastActivity = initialRoomData.last_activity;

    await new Promise((resolve) => setTimeout(resolve, 10));

    await sut.execute({
      roomId: roomCreated.id,
      userId: 'user-id-test',
      vote: 'vote-test',
    });

    const updatedRoomData = await roomsRepository.findById(roomCreated.id);

    expect(updatedRoomData.last_activity).not.toEqual(initialLastActivity);
    expect(updatedRoomData.last_activity.getTime()).toBeGreaterThan(
      initialLastActivity.getTime(),
    );
  });

  it('should update room last_activity when owner votes', async () => {
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
      member: { connect: { id: 'owner-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    const initialRoomData = await roomsRepository.findById(roomCreated.id);
    const initialLastActivity = initialRoomData.last_activity;

    await new Promise((resolve) => setTimeout(resolve, 10));

    await sut.execute({
      roomId: roomCreated.id,
      userId: 'owner-id-test',
      vote: 'owner-vote-test',
    });

    const updatedRoomData = await roomsRepository.findById(roomCreated.id);

    expect(updatedRoomData.last_activity).not.toEqual(initialLastActivity);
    expect(updatedRoomData.last_activity.getTime()).toBeGreaterThan(
      initialLastActivity.getTime(),
    );
  });

  it('should return updated member with vote after voting', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    const memberCreated = await membersRepository.create({
      member: { connect: { id: 'user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    expect(memberCreated.vote).toBeNull();

    const { member } = await sut.execute({
      roomId: roomCreated.id,
      userId: 'user-id-test',
      vote: 'updated-vote-test',
    });

    expect(member.user_id).toBe('user-id-test');
    expect(member.room_id).toBe(roomCreated.id);
    expect(member.vote).toBe('updated-vote-test');
  });

  it('should return null member when owner votes without being explicitly a member', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    // Owner is not explicitly added as a member, but can still vote due to ownership
    // However, since there's no member record, the update and findByUserAndRoomId will return null

    const result = await sut.execute({
      roomId: roomCreated.id,
      userId: 'owner-id-test',
      vote: 'owner-direct-vote',
    });

    expect(result.member).toBeNull();
  });

  it('should allow vote update when changing an existing vote', async () => {
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
      member: { connect: { id: 'user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    const firstVote = await sut.execute({
      roomId: roomCreated.id,
      userId: 'user-id-test',
      vote: 'first-vote',
    });

    expect(firstVote.member.vote).toBe('first-vote');

    const updatedVote = await sut.execute({
      roomId: roomCreated.id,
      userId: 'user-id-test',
      vote: 'updated-vote',
    });

    expect(updatedVote.member.vote).toBe('updated-vote');
    expect(updatedVote.member.user_id).toBe('user-id-test');
    expect(updatedVote.member.room_id).toBe(roomCreated.id);
  });
});
