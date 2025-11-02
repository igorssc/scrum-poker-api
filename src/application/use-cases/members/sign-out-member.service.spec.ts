import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { MembersRepository } from '@/application/repositories/members.repository';
import { InMemoryMembersRepository } from '@/application/repositories/implementations/in-memory/members.repository';
import { StatusRoom } from '@prisma/client';
import { SignOutMemberService } from './sign-out-member.service';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

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
      theme: 'theme-test',
    });

    await membersRepository.create({
      member: { connect: { id: 'user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    const memberCreated = await membersRepository.findByUserAndRoomId({
      userId: 'user-id-test',
      roomId: roomCreated.id,
    });

    expect(memberCreated.user_id).toBe('user-id-test');
    expect(memberCreated.room_id).toBe(roomCreated.id);

    await sut.execute({
      userId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'user-id-test',
    });

    const memberFound = await membersRepository.findByUserAndRoomId({
      userId: 'user-id-test',
      roomId: roomCreated.id,
    });

    expect(memberFound).toBeNull();
  });

  it('should be able to remove from the room having aprove entries permission', async () => {
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

    const memberCreated = await membersRepository.findByUserAndRoomId({
      userId: 'user-id-test',
      roomId: roomCreated.id,
    });

    expect(memberCreated.user_id).toBe('user-id-test');
    expect(memberCreated.room_id).toBe(roomCreated.id);

    await sut.execute({
      userId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'authorized-user-id',
    });

    const memberFound = await membersRepository.findByUserAndRoomId({
      userId: 'user-id-test',
      roomId: roomCreated.id,
    });

    expect(memberFound).toBeNull();
  });

  it('should not be able to remove another user without aprove entries permission', async () => {
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

    const memberCreated = await membersRepository.findByUserAndRoomId({
      userId: 'user-id-test',
      roomId: roomCreated.id,
    });

    expect(memberCreated.user_id).toBe('user-id-test');
    expect(memberCreated.room_id).toBe(roomCreated.id);

    const signOut = sut.execute({
      userId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'other-user-id-test',
    });

    await expect(signOut).rejects.toThrow(UnauthorizedException);

    const memberFound = await membersRepository.findByUserAndRoomId({
      userId: 'user-id-test',
      roomId: roomCreated.id,
    });

    expect(memberFound.user_id).toBe('user-id-test');
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
      theme: 'theme-test',
    });

    await roomsRepository.update(roomCreated.id, {
      who_can_aprove_entries: ['authorized-user-id'],
    });

    const signOut = sut.execute({
      userId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'authorized-user-id',
    });

    await expect(signOut).rejects.toThrow(BadRequestException);
  });

  it('should not be able to remove non-existent room', async () => {
    const signOut = sut.execute({
      userId: 'user-id-test',
      roomId: 'room-id-test',
      userActionId: 'owner-id-test',
    });

    await expect(signOut).rejects.toThrow(NotFoundException);
  });

  it('should remove user permissions when signing out member with edit permissions', async () => {
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
      who_can_edit: ['user-id-test'],
      who_can_open_cards: ['user-id-test'],
      who_can_aprove_entries: ['user-id-test'],
    });

    await membersRepository.create({
      member: { connect: { id: 'user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    await sut.execute({
      userId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'user-id-test',
    });

    const roomAfterSignOut = await roomsRepository.findById(roomCreated.id);

    expect(roomAfterSignOut.who_can_edit).not.toContain('user-id-test');
    expect(roomAfterSignOut.who_can_open_cards).not.toContain('user-id-test');
    expect(roomAfterSignOut.who_can_aprove_entries).not.toContain(
      'user-id-test',
    );
  });

  it('should remove user permissions when authorized user removes member with permissions', async () => {
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
      who_can_edit: ['user-id-test', 'other-user-id'],
      who_can_open_cards: ['user-id-test', 'other-user-id'],
      who_can_aprove_entries: [
        'user-id-test',
        'other-user-id',
        'authorized-user-id',
      ],
    });

    await membersRepository.create({
      member: { connect: { id: 'user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    await sut.execute({
      userId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'authorized-user-id',
    });

    const roomAfterSignOut = await roomsRepository.findById(roomCreated.id);

    expect(roomAfterSignOut.who_can_edit).toEqual(['other-user-id']);
    expect(roomAfterSignOut.who_can_open_cards).toEqual(['other-user-id']);
    expect(roomAfterSignOut.who_can_aprove_entries).toEqual([
      'other-user-id',
      'authorized-user-id',
    ]);
  });

  it('should not update room permissions if user has no permissions', async () => {
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
      who_can_edit: ['other-user-id'],
      who_can_open_cards: ['other-user-id'],
      who_can_aprove_entries: ['other-user-id'],
    });

    await membersRepository.create({
      member: { connect: { id: 'user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    await sut.execute({
      userId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'user-id-test',
    });

    const roomAfterSignOut = await roomsRepository.findById(roomCreated.id);

    expect(roomAfterSignOut.who_can_edit).toEqual(['other-user-id']);
    expect(roomAfterSignOut.who_can_open_cards).toEqual(['other-user-id']);
    expect(roomAfterSignOut.who_can_aprove_entries).toEqual(['other-user-id']);
  });

  it('should remove only specific user permissions while maintaining others', async () => {
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
      who_can_edit: ['user-id-test', 'other-user-id'],
      who_can_open_cards: ['other-user-id'],
      who_can_aprove_entries: ['user-id-test', 'other-user-id'],
    });

    await membersRepository.create({
      member: { connect: { id: 'user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    await sut.execute({
      userId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'user-id-test',
    });

    const roomAfterSignOut = await roomsRepository.findById(roomCreated.id);

    expect(roomAfterSignOut.who_can_edit).toEqual(['other-user-id']);
    expect(roomAfterSignOut.who_can_open_cards).toEqual(['other-user-id']);
    expect(roomAfterSignOut.who_can_aprove_entries).toEqual(['other-user-id']);
  });

  it('should successfully sign out member and clear all permissions arrays', async () => {
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
      who_can_edit: ['user-id-test'],
      who_can_open_cards: ['user-id-test'],
      who_can_aprove_entries: ['user-id-test'],
    });

    await membersRepository.create({
      member: { connect: { id: 'user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    await sut.execute({
      userId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'user-id-test',
    });

    const memberFound = await membersRepository.findByUserAndRoomId({
      userId: 'user-id-test',
      roomId: roomCreated.id,
    });
    expect(memberFound).toBeNull();

    const roomAfterSignOut = await roomsRepository.findById(roomCreated.id);
    expect(roomAfterSignOut.who_can_edit).toEqual([]);
    expect(roomAfterSignOut.who_can_open_cards).toEqual([]);
    expect(roomAfterSignOut.who_can_aprove_entries).toEqual([]);
  });

  it('should allow user with aprove entries permission to remove any member', async () => {
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

    await sut.execute({
      userId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'moderator-id',
    });

    const memberFound = await membersRepository.findByUserAndRoomId({
      userId: 'user-id-test',
      roomId: roomCreated.id,
    });

    expect(memberFound).toBeNull();
  });

  it('should not allow user without aprove entries permission to remove other members', async () => {
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

    const signOut = sut.execute({
      userId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'unauthorized-user-id',
    });

    await expect(signOut).rejects.toThrow(UnauthorizedException);

    const memberFound = await membersRepository.findByUserAndRoomId({
      userId: 'user-id-test',
      roomId: roomCreated.id,
    });

    expect(memberFound).not.toBeNull();
    expect(memberFound.user_id).toBe('user-id-test');
  });

  it('should allow multiple users with aprove entries permission to remove members', async () => {
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
      member: { connect: { id: 'user-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    await membersRepository.create({
      member: { connect: { id: 'user-id-test-2' } },
      room: { connect: { id: roomCreated.id } },
    });

    await sut.execute({
      userId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'moderator-1',
    });

    await sut.execute({
      userId: 'user-id-test-2',
      roomId: roomCreated.id,
      userActionId: 'moderator-2',
    });

    const member1Found = await membersRepository.findByUserAndRoomId({
      userId: 'user-id-test',
      roomId: roomCreated.id,
    });

    const member2Found = await membersRepository.findByUserAndRoomId({
      userId: 'user-id-test-2',
      roomId: roomCreated.id,
    });

    expect(member1Found).toBeNull();
    expect(member2Found).toBeNull();
  });

  it('should still allow self sign-out even without aprove entries permission', async () => {
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

    await sut.execute({
      userId: 'user-id-test',
      roomId: roomCreated.id,
      userActionId: 'user-id-test',
    });

    const memberFound = await membersRepository.findByUserAndRoomId({
      userId: 'user-id-test',
      roomId: roomCreated.id,
    });

    expect(memberFound).toBeNull();
  });
});
