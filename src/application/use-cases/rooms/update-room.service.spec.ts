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

  it('should allow only owner to modify permissions', async () => {
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
      who_can_edit: ['member-id-test'],
    });

    await membersRepository.create({
      member: { connect: { id: 'member-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    await membersRepository.create({
      member: { connect: { id: 'owner-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    const { room: ownerUpdate } = await sut.execute(
      {
        roomId: roomCreated.id,
        userId: 'owner-id-test',
      },
      { 
        who_can_edit: ['new-user-id'],
      },
    );

    expect(ownerUpdate.who_can_edit).toContain('owner-id-test');
    expect(ownerUpdate.who_can_edit).toContain('new-user-id');

    const memberPermissionUpdate = sut.execute(
      {
        roomId: roomCreated.id,
        userId: 'member-id-test',
      },
      { 
        who_can_open_cards: ['another-user-id'],
      },
    );

    await expect(memberPermissionUpdate).rejects.toThrow(UnauthorizedException);
  });

  it('should allow only users with who_can_open_cards permission to modify timer', async () => {
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
      who_can_open_cards: ['authorized-user-id'],
      who_can_edit: ['member-id-test'],
    });

    await membersRepository.create({
      member: { connect: { id: 'authorized-user-id' } },
      room: { connect: { id: roomCreated.id } },
    });

    await membersRepository.create({
      member: { connect: { id: 'member-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    await membersRepository.create({
      member: { connect: { id: 'owner-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    const startDate = new Date();
    const { room: ownerTimerUpdate } = await sut.execute(
      {
        roomId: roomCreated.id,
        userId: 'owner-id-test',
      },
      { 
        start_timer: startDate,
      },
    );


    const stopDate = new Date();
    const { room: authorizedTimerUpdate } = await sut.execute(
      {
        roomId: roomCreated.id,
        userId: 'authorized-user-id',
      },
      { 
        stop_timer: stopDate,
      },
    );


    const memberTimerUpdate = sut.execute(
      {
        roomId: roomCreated.id,
        userId: 'member-id-test',
      },
      { 
        start_timer: new Date(),
      },
    );

    await expect(memberTimerUpdate).rejects.toThrow(UnauthorizedException);
  });

  it('should allow regular updates for users with edit permission', async () => {
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
        name: 'Updated by Member',
        theme: 'new-theme',
        private: true,
        lat: 10.5,
        lng: -20.3,
      },
    );

    expect(roomUpdated.name).toBe('Updated By Member');
    expect(roomUpdated.theme).toBe('new-theme');
    expect(roomUpdated.private).toBe(true);
    expect(roomUpdated.lat).toBe(10.5);
    expect(roomUpdated.lng).toBe(-20.3);
  });

  it('should not allow combined permission and timer changes for non-owner', async () => {
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
      who_can_edit: ['member-id-test'],
      who_can_open_cards: ['member-id-test'],
    });

    await membersRepository.create({
      member: { connect: { id: 'member-id-test' } },
      room: { connect: { id: roomCreated.id } },
    });

    const timerDate = new Date();
    const { room: timerUpdate } = await sut.execute(
      {
        roomId: roomCreated.id,
        userId: 'member-id-test',
      },
      { 
        start_timer: timerDate,
      },
    );


    const permissionUpdate = sut.execute(
      {
        roomId: roomCreated.id,
        userId: 'member-id-test',
      },
      { 
        who_can_edit: ['another-user-id'],
        name: 'Updated Name',
      },
    );

    await expect(permissionUpdate).rejects.toThrow(UnauthorizedException);
  });
});
