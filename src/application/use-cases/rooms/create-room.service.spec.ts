import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateRoomService } from '../rooms/create-room.service';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { UsersRepository } from '@/application/repositories/users.repository';
import { InMemoryUsersRepository } from '@/application/repositories/implementations/in-memory/users.repository';
import { MembersRepository } from '@/application/repositories/members.repository';
import { InMemoryMembersRepository } from '@/application/repositories/implementations/in-memory/members.repository';
import { CreateUserService } from '../users/create-user.service';
import { BadRequestException } from '@nestjs/common';

describe('Create Room Use Case', () => {
  let sut: CreateRoomService;
  let usersRepository: UsersRepository;
  let membersRepository: MembersRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoomService,
        CreateUserService,
        { provide: RoomsRepository, useClass: InMemoryRoomsRepository },
        { provide: UsersRepository, useClass: InMemoryUsersRepository },
        { provide: MembersRepository, useClass: InMemoryMembersRepository },
      ],
    }).compile();

    sut = moduleRef.get(CreateRoomService);
    usersRepository = moduleRef.get(UsersRepository);
    membersRepository = moduleRef.get(MembersRepository);
  });

  it('should be able to create room', async () => {
    const { room } = await sut.execute({
      name: '0000 0000 0001',
      userName: 'John Doe',
    });

    expect(room.id).toEqual(expect.any(String));
    expect(room.access).toEqual(expect.any(String));
    expect(room.owner_id).toEqual(expect.any(String));
    expect(room.status).toEqual('OPEN');
    expect(room.name).toEqual('0000 0000 0001');
    expect(room.lat).toBeUndefined();
    expect(room.lng).toBeUndefined();
    expect(room.private).toBe(false);
  });

  it('should be able to create room with lat and lng', async () => {
    const { room } = await sut.execute({
      name: '0000 0000 0001',
      userName: 'John Doe',
      lat: 40.802793,
      lng: -73.679391,
    });

    expect(room.id).toEqual(expect.any(String));
    expect(room.access).toEqual(expect.any(String));
    expect(room.owner_id).toEqual(expect.any(String));
    expect(room.status).toEqual('OPEN');
    expect(room.name).toEqual('0000 0000 0001');
    expect(room.lat).toBe(40.802793);
    expect(room.lng).toBe(-73.679391);
    expect(room.private).toBe(false);
  });

  it('should be able to create room private', async () => {
    const { room } = await sut.execute({
      name: '0000 0000 0001',
      userName: 'John Doe',
      private: true,
    });

    expect(room.id).toEqual(expect.any(String));
    expect(room.access).toEqual(expect.any(String));
    expect(room.owner_id).toEqual(expect.any(String));
    expect(room.status).toEqual('OPEN');
    expect(room.name).toEqual('0000 0000 0001');
    expect(room.lat).toBeUndefined();
    expect(room.lng).toBeUndefined();
    expect(room.private).toBe(true);
  });

  it('should be able to create a user when creating room', async () => {
    const { room } = await sut.execute({
      name: '0000 0000 0001',
      userName: 'John Doe',
    });

    expect(room.id).toEqual(expect.any(String));

    const owner = await usersRepository.findById(room.owner_id);

    expect(owner.id).toBe(room.owner_id);
    expect(owner.name).toBe('John Doe');
  });

  it('should be able to create a user with a lower case when creating room', async () => {
    const { room } = await sut.execute({
      name: '0000 0000 0001',
      userName: 'john doe',
    });

    expect(room.id).toEqual(expect.any(String));

    const owner = await usersRepository.findById(room.owner_id);

    expect(owner.id).toBe(room.owner_id);
    expect(owner.name).toBe('John Doe');
  });

  it('should be able to link the user to the created room', async () => {
    const { room } = await sut.execute({
      name: '0000 0000 0001',
      userName: 'john doe',
    });

    const member = await membersRepository.findByMemberAndRoomId({
      memberId: room.owner_id,
      roomId: room.id,
    });

    expect(member.member_id).toBe(room.owner_id);
    expect(member.room_id).toBe(room.id);
    expect(member.vote).toBeNull();
  });

  it('should not be able to create a room with a non-existent user', async () => {
    const request = sut.execute({
      name: '0000 0000 0001',
      userName: 'John Doe',
      userId: 'test',
      private: true,
    });

    expect(request).rejects.toThrow(BadRequestException);
  });
});
