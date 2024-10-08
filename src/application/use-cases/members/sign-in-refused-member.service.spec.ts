import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { MembersRepository } from '@/application/repositories/members.repository';
import { InMemoryMembersRepository } from '@/application/repositories/implementations/in-memory/members.repository';
import { StatusRoom } from '@prisma/client';
import { SignInRefuseMemberService } from './sign-in-refuse-member.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('Sign In Refuse Member Use Case', () => {
  let sut: SignInRefuseMemberService;
  let roomsRepository: RoomsRepository;
  let membersRepository: MembersRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SignInRefuseMemberService,
        { provide: RoomsRepository, useClass: InMemoryRoomsRepository },
        { provide: MembersRepository, useClass: InMemoryMembersRepository },
      ],
    }).compile();

    sut = moduleRef.get(SignInRefuseMemberService);
    roomsRepository = moduleRef.get(RoomsRepository);
    membersRepository = moduleRef.get(MembersRepository);
  });

  it('should be able to refuse sign in into the room being the owner', async () => {
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
      ownerId: roomCreated.owner_id,
    });

    const memberFound = await membersRepository.findByUserAndRoomId({
      roomId: roomCreated.id,
      userId: 'user-id-test',
    });

    expect(memberFound.user_id).toBe(memberCreated.user_id);
    expect(memberFound.room_id).toBe(roomCreated.id);
    expect(memberFound.vote).toBeNull();
  });

  it('should not be able to refuse sign in the room if not the owner', async () => {
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
      ownerId: 'other-owner-id-test',
    });

    expect(memberCreated).rejects.toThrow(UnauthorizedException);
  });

  it('should not be able to refuse sign in the non-existent room', async () => {
    const memberCreated = sut.execute({
      roomId: 'room-id-test',
      userId: 'user-id-test',
      access: 'access-id-room',
      ownerId: 'other-owner-id-test',
    });

    expect(memberCreated).rejects.toThrow(BadRequestException);
  });

  it('should not be able to refuse sign in the current room', async () => {
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
      ownerId: 'other-owner-id-test',
    });

    expect(memberCreated).rejects.toThrow(UnauthorizedException);
  });

  it('should not be able to refuse sign in the room with incorrect access', async () => {
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
      ownerId: 'other-owner-id-test',
    });

    expect(memberCreated).rejects.toThrow(UnauthorizedException);
  });
});
