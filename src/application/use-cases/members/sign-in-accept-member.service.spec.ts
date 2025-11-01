import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { MembersRepository } from '@/application/repositories/members.repository';
import { InMemoryMembersRepository } from '@/application/repositories/implementations/in-memory/members.repository';
import { StatusRoom } from '@prisma/client';
import { SignInAcceptMemberService } from './sign-in-accept-member.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('Sign In Accept Member Use Case', () => {
  let sut: SignInAcceptMemberService;
  let roomsRepository: RoomsRepository;
  let membersRepository: MembersRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SignInAcceptMemberService,
        { provide: RoomsRepository, useClass: InMemoryRoomsRepository },
        { provide: MembersRepository, useClass: InMemoryMembersRepository },
      ],
    }).compile();

    sut = moduleRef.get(SignInAcceptMemberService);
    roomsRepository = moduleRef.get(RoomsRepository);
    membersRepository = moduleRef.get(MembersRepository);
  });

  it('should be able to accept sign in into the room being the owner', async () => {
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

    const { member: memberCreated } = await sut.execute({
      roomId: roomCreated.id,
      userId: 'user-id-test',
      access: roomCreated.access,
      userActionId: roomCreated.owner_id,
    });

    const memberFound = await membersRepository.findByUserAndRoomId({
      roomId: roomCreated.id,
      userId: 'user-id-test',
    });

    expect(memberFound.user_id).toBe(memberCreated.user_id);
    expect(memberFound.room_id).toBe(roomCreated.id);
    expect(memberFound.vote).toBeNull();
  });

  it('should not be able to accept sign in the room without proper permissions', async () => {
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

    const memberCreated = sut.execute({
      roomId: roomCreated.id,
      userId: 'user-id-test',
      access: roomCreated.access,
      userActionId: 'unauthorized-user-id',
    });

    await expect(memberCreated).rejects.toThrow(UnauthorizedException);
  });

  it('should not be able to accept sign in the non-existent room', async () => {
    const memberCreated = sut.execute({
      roomId: 'room-id-test',
      userId: 'user-id-test',
      access: 'access-id-room',
      userActionId: 'user-action-id-test',
    });

    await expect(memberCreated).rejects.toThrow(NotFoundException);
  });

  it('should not be able to accept sign in the current room without permissions', async () => {
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

    const memberCreated = sut.execute({
      roomId: roomCreated.id,
      userId: 'user-id-test',
      access: roomCreated.access,
      userActionId: 'unauthorized-user-id',
    });

    await expect(memberCreated).rejects.toThrow(UnauthorizedException);
  });

  it('should not be able to accept sign in the room with incorrect access', async () => {
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

    const memberCreated = sut.execute({
      roomId: roomCreated.id,
      userId: 'user-id-test',
      access: 'access-id-test',
      userActionId: roomCreated.owner_id,
    });

    await expect(memberCreated).rejects.toThrow(UnauthorizedException);
  });

  it('should be able to accept sign in with aprove entries permission', async () => {
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
      who_can_aprove_entries: ['moderator-id'],
    });

    await membersRepository.create({
      member: { connect: { id: 'user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    const { member: memberCreated } = await sut.execute({
      roomId: roomCreated.id,
      userId: 'user-id-test',
      access: roomCreated.access,
      userActionId: 'moderator-id',
    });

    const memberFound = await membersRepository.findByUserAndRoomId({
      roomId: roomCreated.id,
      userId: 'user-id-test',
    });

    expect(memberFound.user_id).toBe(memberCreated.user_id);
    expect(memberFound.room_id).toBe(roomCreated.id);
    expect(memberFound.status).toBe('LOGGED');
  });

  it('should not be able to accept sign in without aprove entries permission', async () => {
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
      who_can_aprove_entries: ['authorized-user-id'],
    });

    await membersRepository.create({
      member: { connect: { id: 'user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    const memberCreated = sut.execute({
      roomId: roomCreated.id,
      userId: 'user-id-test',
      access: roomCreated.access,
      userActionId: 'unauthorized-user-id',
    });

    await expect(memberCreated).rejects.toThrow(UnauthorizedException);
  });

  it('should allow multiple users with aprove entries permission to accept members', async () => {
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
      who_can_aprove_entries: ['moderator-1', 'moderator-2'],
    });

    await membersRepository.create({
      member: { connect: { id: 'user-id-test-1' } },
      room: { connect: { id: roomCreated.id } },
    });

    await membersRepository.create({
      member: { connect: { id: 'user-id-test-2' } },
      room: { connect: { id: roomCreated.id } },
    });

    const { member: member1 } = await sut.execute({
      roomId: roomCreated.id,
      userId: 'user-id-test-1',
      access: roomCreated.access,
      userActionId: 'moderator-1',
    });

    const { member: member2 } = await sut.execute({
      roomId: roomCreated.id,
      userId: 'user-id-test-2',
      access: roomCreated.access,
      userActionId: 'moderator-2',
    });

    expect(member1.status).toBe('LOGGED');
    expect(member2.status).toBe('LOGGED');
  });

  it('should allow owner to accept even without explicit aprove entries permission', async () => {
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

    const { member: memberCreated } = await sut.execute({
      roomId: roomCreated.id,
      userId: 'user-id-test',
      access: roomCreated.access,
      userActionId: roomCreated.owner_id,
    });

    expect(memberCreated.status).toBe('LOGGED');
  });
});
