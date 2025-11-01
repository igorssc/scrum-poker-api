import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { StatusRoom } from '@prisma/client';
import { UpdateRoomService } from './update-room.service';
import { InMemoryMembersRepository } from '@/application/repositories/implementations/in-memory/members.repository';
import { MembersRepository } from '@/application/repositories/members.repository';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('Update Room Use Case', () => {
  let sut: UpdateRoomService;
  let roomsRepository: RoomsRepository;
  let membersRepository: MembersRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRoomService,
        { provide: RoomsRepository, useClass: InMemoryRoomsRepository },
        { provide: MembersRepository, useClass: InMemoryMembersRepository },
      ],
    }).compile();

    sut = moduleRef.get(UpdateRoomService);
    roomsRepository = moduleRef.get(RoomsRepository);
    membersRepository = moduleRef.get(MembersRepository);
  });

  it('should be able to update room', async () => {
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

    const { room: roomUpdated } = await sut.execute(
      {
        roomId: roomCreated.id,
        userId: 'user-id-test',
      },
      { name: 'Test Name' },
    );

    expect(roomUpdated.id).toEqual(roomCreated.id);

    const findRoomUpdated = await roomsRepository.findById(roomCreated.id);

    expect(findRoomUpdated.name).toBe('Test Name');
  });

  it('should be able to update room with a lower case', async () => {
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

    const { room: roomUpdated } = await sut.execute(
      {
        roomId: roomCreated.id,
        userId: 'user-id-test',
      },
      { name: 'test name' },
    );

    expect(roomUpdated.id).toEqual(roomCreated.id);

    const findRoomUpdated = await roomsRepository.findById(roomCreated.id);

    expect(findRoomUpdated.name).toBe('Test Name');
  });

  it('should not be able to update the room without being a member', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    const roomUpdated = sut.execute(
      {
        roomId: roomCreated.id,
        userId: 'user-other-id-test',
      },
      { name: 'test name' },
    );

    await expect(roomUpdated).rejects.toThrow(UnauthorizedException);
  });

  it('should not be able to upgrade non-existing room', async () => {
    const roomUpdated = sut.execute(
      {
        roomId: 'room-id-test',
        userId: 'user-id-test',
      },
      { name: 'test name' },
    );

    await expect(roomUpdated).rejects.toThrow(NotFoundException);
  });

  it('should allow owner to update permission arrays', async () => {
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

    const { room: roomUpdated } = await sut.execute(
      {
        roomId: roomCreated.id,
        userId: 'owner-id-test',
      },
      { 
        who_can_edit: ['user1', 'user2'],
        who_can_open_cards: ['user3'],
        who_can_aprove_entries: ['user1', 'user3'],
      },
    );

    expect(roomUpdated.who_can_edit).toEqual(['user1', 'user2', 'owner-id-test']);
    expect(roomUpdated.who_can_open_cards).toEqual(['user3', 'owner-id-test']);
    expect(roomUpdated.who_can_aprove_entries).toEqual(['user1', 'user3', 'owner-id-test']);
  });

  it('should not allow non-owner to update permission arrays', async () => {
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
      member: { connect: { id: 'member-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    const roomUpdated = sut.execute(
      {
        roomId: roomCreated.id,
        userId: 'member-id-test',
      },
      { 
        who_can_edit: ['user1', 'user2'],
      },
    );

    await expect(roomUpdated).rejects.toThrow(UnauthorizedException);
  });

  it('should allow members in who_can_edit to update basic room fields', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'owner-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    // Atualiza a sala para permitir que member-id-test possa editar
    await roomsRepository.update(roomCreated.id, {
      who_can_edit: ['member-id-test'],
    });

    await membersRepository.create({
      member: { connect: { id: 'member-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    const { room: roomUpdated } = await sut.execute(
      {
        roomId: roomCreated.id,
        userId: 'member-id-test',
      },
      { 
        name: 'Updated Room Name',
        theme: 'new-theme',
      },
    );

    expect(roomUpdated.name).toBe('Updated Room Name');
    expect(roomUpdated.theme).toBe('new-theme');
  });
});
