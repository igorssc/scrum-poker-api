import { describe, it, expect, beforeEach } from 'vitest';
import { CleanupInactiveRoomsService } from './cleanup-inactive-rooms.service';
import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { StatusRoom } from '@prisma/client';

describe('CleanupInactiveRoomsService', () => {
  let sut: CleanupInactiveRoomsService;
  let roomsRepository: InMemoryRoomsRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CleanupInactiveRoomsService,
        { provide: RoomsRepository, useClass: InMemoryRoomsRepository },
      ],
    }).compile();

    sut = moduleRef.get(CleanupInactiveRoomsService);
    roomsRepository = moduleRef.get(RoomsRepository);
  });

  it('should close rooms inactive for more than 7 days', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10); // 10 days ago

    const room1 = await roomsRepository.create({
      name: 'Old Room 1',
      owner: { connect: { id: 'owner-id-1' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    await roomsRepository.update(room1.id, { last_activity: oldDate });

    const room2 = await roomsRepository.create({
      name: 'Old Room 2',
      owner: { connect: { id: 'owner-id-2' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    await roomsRepository.update(room2.id, { last_activity: oldDate });

    await roomsRepository.create({
      name: 'Recent Room',
      owner: { connect: { id: 'owner-id-3' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    const result = await sut.execute();

    expect(result.closedRoomsCount).toBe(2);
    expect(result.closedRoomIds).toContain(room1.id);
    expect(result.closedRoomIds).toContain(room2.id);

    const updatedRoom1 = await roomsRepository.findById(room1.id);
    const updatedRoom2 = await roomsRepository.findById(room2.id);

    expect(updatedRoom1).toBeNull();
    expect(updatedRoom2).toBeNull();
  });

  it('should not close rooms that are already closed', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10); // 10 days ago

    const room = await roomsRepository.create({
      name: 'Closed Room',
      owner: { connect: { id: 'owner-id-1' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    await roomsRepository.update(room.id, {
      last_activity: oldDate,
      status: StatusRoom.CLOSED,
    });

    const result = await sut.execute();

    expect(result.closedRoomsCount).toBe(0);
    expect(result.closedRoomIds).toHaveLength(0);
  });

  it('should not close rooms with recent activity', async () => {
    await roomsRepository.create({
      name: 'Recent Room',
      owner: { connect: { id: 'owner-id-1' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    const result = await sut.execute();

    expect(result.closedRoomsCount).toBe(0);
    expect(result.closedRoomIds).toHaveLength(0);
  });

  it('should return empty result when no rooms exist', async () => {
    const result = await sut.execute();

    expect(result.closedRoomsCount).toBe(0);
    expect(result.closedRoomIds).toHaveLength(0);
  });

  it('should close rooms with exactly 7+ days of inactivity', async () => {
    const exactlySevenDaysAgo = new Date();
    exactlySevenDaysAgo.setDate(exactlySevenDaysAgo.getDate() - 7);
    exactlySevenDaysAgo.setSeconds(exactlySevenDaysAgo.getSeconds() - 1); // Make it slightly older

    const room = await roomsRepository.create({
      name: 'Exactly 7 Days Old Room',
      owner: { connect: { id: 'owner-id-1' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    await roomsRepository.update(room.id, {
      last_activity: exactlySevenDaysAgo,
    });

    const result = await sut.execute();

    expect(result.closedRoomsCount).toBe(1);
    expect(result.closedRoomIds).toContain(room.id);
  });
});
