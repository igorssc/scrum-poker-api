import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { MembersRepository } from '@/application/repositories/members.repository';
import { InMemoryMembersRepository } from '@/application/repositories/implementations/in-memory/members.repository';
import { StatusRoom } from '@prisma/client';
import { SignOutMemberService } from './sign-out-member.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('Sign Out Member Use Case', () => {
  let sut: SignOutMemberService;
  let roomsRepository: RoomsRepository;
  let membersRepository: MembersRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SignOutMemberService,
        { provide: RoomsRepository, useClass: InMemoryRoomsRepository },
        { provide: MembersRepository, useClass: InMemoryMembersRepository },
      ],
    }).compile();

    sut = moduleRef.get(SignOutMemberService);
    roomsRepository = moduleRef.get(RoomsRepository);
    membersRepository = moduleRef.get(MembersRepository);
  });

  it('should be able to sign out in the room', async () => {
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

    const memberCreated = await membersRepository.findByMemberAndRoomId({
      memberId: 'user-id-test',
      roomId: roomCreated.id,
    });

    expect(memberCreated.member_id).toBe('user-id-test');
    expect(memberCreated.room_id).toBe(roomCreated.id);

    await sut.execute({
      memberId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'user-id-test',
    });

    const memberFound = await membersRepository.findByMemberAndRoomId({
      memberId: 'user-id-test',
      roomId: roomCreated.id,
    });

    expect(memberFound).toBeNull();
  });

  it('should be able to remove from the room being the owner', async () => {
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

    const memberCreated = await membersRepository.findByMemberAndRoomId({
      memberId: 'user-id-test',
      roomId: roomCreated.id,
    });

    expect(memberCreated.member_id).toBe('user-id-test');
    expect(memberCreated.room_id).toBe(roomCreated.id);

    await sut.execute({
      memberId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'owner-id-test',
    });

    const memberFound = await membersRepository.findByMemberAndRoomId({
      memberId: 'user-id-test',
      roomId: roomCreated.id,
    });

    expect(memberFound).toBeNull();
  });

  it('should be able to remove another user from the room who is not the owner', async () => {
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

    const memberCreated = await membersRepository.findByMemberAndRoomId({
      memberId: 'user-id-test',
      roomId: roomCreated.id,
    });

    expect(memberCreated.member_id).toBe('user-id-test');
    expect(memberCreated.room_id).toBe(roomCreated.id);

    const signOut = sut.execute({
      memberId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'other-user-id-test',
    });

    expect(signOut).rejects.toThrow(UnauthorizedException);

    const memberFound = await membersRepository.findByMemberAndRoomId({
      memberId: 'user-id-test',
      roomId: roomCreated.id,
    });

    expect(memberFound.member_id).toBe('user-id-test');
    expect(memberFound.room_id).toBe(roomCreated.id);
  });

  it('should not be able to remove non-existent user', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
    });

    const signOut = sut.execute({
      memberId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'owner-id-test',
    });

    expect(signOut).rejects.toThrow(BadRequestException);
  });

  it('should not be able to remove non-existent room', async () => {
    const signOut = sut.execute({
      memberId: 'user-id-test',
      roomId: 'room-id-test',
      userActionId: 'owner-id-test',
    });

    expect(signOut).rejects.toThrow(BadRequestException);
  });
});
