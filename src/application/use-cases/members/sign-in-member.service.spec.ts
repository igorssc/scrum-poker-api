import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { MembersRepository } from '@/application/repositories/members.repository';
import { InMemoryMembersRepository } from '@/application/repositories/implementations/in-memory/members.repository';
import { StatusRoom } from '@prisma/client';
import { SignInMemberService } from './sign-in-member.service';
import { CreateUserService } from '../users/create-user.service';
import { UsersRepository } from '@/application/repositories/users.repository';
import { InMemoryUsersRepository } from '@/application/repositories/implementations/in-memory/users.repository';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('Sign In Member Use Case', () => {
  let sut: SignInMemberService;
  let roomsRepository: RoomsRepository;
  let membersRepository: MembersRepository;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SignInMemberService,
        CreateUserService,
        { provide: RoomsRepository, useClass: InMemoryRoomsRepository },
        { provide: UsersRepository, useClass: InMemoryUsersRepository },
        { provide: MembersRepository, useClass: InMemoryMembersRepository },
      ],
    }).compile();

    sut = moduleRef.get(SignInMemberService);
    roomsRepository = moduleRef.get(RoomsRepository);
    membersRepository = moduleRef.get(MembersRepository);
    usersRepository = moduleRef.get(UsersRepository);
  });

  it('should be able to sign in in the room with access and without user', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    const { user } = await sut.execute({
      roomId: roomCreated.id,
      userName: 'John Doe',
      access: roomCreated.access,
    });

    const userCreated = await usersRepository.findById(user.id);

    expect(userCreated.id).toEqual(expect.any(String));
    expect(userCreated.name).toBe('John Doe');

    const member = await membersRepository.findByUserAndRoomId({
      roomId: roomCreated.id,
      userId: userCreated.id,
    });

    expect(member.user_id).toBe(userCreated.id);
    expect(member.room_id).toBe(roomCreated.id);
    expect(member.vote).toBeNull();
  });

  it('should be able to sign in in the room with access and with user', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    const userCreated = await usersRepository.create({
      name: 'John Doe',
    });

    expect(userCreated.id).toEqual(expect.any(String));
    expect(userCreated.name).toBe('John Doe');

    await sut.execute({
      roomId: roomCreated.id,
      userName: 'John Doe',
      access: roomCreated.access,
      userId: userCreated.id,
    });

    const member = await membersRepository.findByUserAndRoomId({
      roomId: roomCreated.id,
      userId: userCreated.id,
    });

    expect(member.user_id).toBe(userCreated.id);
    expect(member.room_id).toBe(roomCreated.id);
    expect(member.vote).toBeNull();
  });

  it('should be able to sign in to the room with user and change the name', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    const userCreated = await usersRepository.create({
      name: 'John Doe',
    });

    expect(userCreated.id).toEqual(expect.any(String));
    expect(userCreated.name).toBe('John Doe');

    await sut.execute({
      roomId: roomCreated.id,
      userName: 'Alicie Smith',
      access: roomCreated.access,
      userId: userCreated.id,
    });

    const member = await membersRepository.findByUserAndRoomId({
      roomId: roomCreated.id,
      userId: userCreated.id,
    });

    expect(member.user_id).toBe(userCreated.id);
    expect(member.room_id).toBe(roomCreated.id);
    expect(member.vote).toBeNull();

    const userFound = await usersRepository.findById(userCreated.id);

    expect(userFound.name).toBe('Alicie Smith');
  });

  it('should not be able to sign in to the current room', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    const userCreated = await usersRepository.create({
      name: 'John Doe',
    });

    await membersRepository.create({
      room: { connect: { id: roomCreated.id } },
      member: { connect: { id: userCreated.id } },
    });

    const signInMember = sut.execute({
      roomId: roomCreated.id,
      userName: userCreated.name,
      access: roomCreated.access,
      userId: userCreated.id,
    });

    expect(signInMember).rejects.toThrow(UnauthorizedException);
  });

  it('should not be able to sign in a non-existent room', async () => {
    const userCreated = await usersRepository.create({
      name: 'John Doe',
    });

    const signInMember = sut.execute({
      roomId: 'room-id-test',
      userName: 'John Doe',
      userId: userCreated.id,
    });

    expect(signInMember).rejects.toThrow(BadRequestException);
  });

  it('should not be able to sign in a non-existent user', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    const signInMember = sut.execute({
      roomId: roomCreated.id,
      userName: 'John Doe',
      userId: 'user-id-test',
    });

    expect(signInMember).rejects.toThrow(BadRequestException);
  });
});
