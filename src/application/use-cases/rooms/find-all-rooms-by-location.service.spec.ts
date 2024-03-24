import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { StatusRoom } from '@prisma/client';
import { FindAllRoomsByLocationService } from './find-all-rooms-by-location.service';

describe('Find All Rooms By Location Use Case', () => {
  let sut: FindAllRoomsByLocationService;
  let roomsRepository: RoomsRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllRoomsByLocationService,
        { provide: RoomsRepository, useClass: InMemoryRoomsRepository },
      ],
    }).compile();

    sut = moduleRef.get(FindAllRoomsByLocationService);
    roomsRepository = moduleRef.get(RoomsRepository);
  });

  it('should be able to find all rooms by location', async () => {
    const newYorkLocation = {
      lat: 40.7128,
      lng: -74.006,
    };

    await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: newYorkLocation.lat,
      lng: newYorkLocation.lng,
      private: false,
    });

    await roomsRepository.create({
      name: '0000 0000 0002',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: newYorkLocation.lat,
      lng: newYorkLocation.lng,
      private: false,
    });

    const roomsFound = await sut.execute({
      lat: newYorkLocation.lat,
      lng: newYorkLocation.lng,
      max_distance: 100,
    });

    expect(roomsFound).toHaveLength(2);
    expect(roomsFound[0].name).toEqual('0000 0000 0001');
    expect(roomsFound[0].lat).toEqual(newYorkLocation.lat);
    expect(roomsFound[0].lng).toEqual(newYorkLocation.lng);
    expect(roomsFound[0].private).toEqual(false);
    expect(roomsFound[0].status).toEqual('OPEN');
  });

  it('should be able to find all rooms by location within 1km', async () => {
    const newYorkLocation = {
      lat: 40.7128,
      lng: -74.006,
    };

    const oneKmAwayFromLocation = {
      lat: 40.720013,
      lng: -74.006,
    };

    await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: newYorkLocation.lat,
      lng: newYorkLocation.lng,
      private: false,
    });

    const roomsFound = await sut.execute({
      lat: oneKmAwayFromLocation.lat,
      lng: oneKmAwayFromLocation.lng,
      max_distance: 1000,
    });

    expect(roomsFound).toHaveLength(1);
    expect(roomsFound[0].name).toEqual('0000 0000 0001');
    expect(roomsFound[0].lat).toEqual(newYorkLocation.lat);
    expect(roomsFound[0].lng).toEqual(newYorkLocation.lng);
    expect(roomsFound[0].private).toEqual(false);
    expect(roomsFound[0].status).toEqual('OPEN');
  });

  it('should be able to find all rooms by location within 5km', async () => {
    const newYorkLocation = {
      lat: 40.7128,
      lng: -74.006,
    };

    const fiveKmAwayFromLocation = {
      lat: 40.757,
      lng: -74.006,
    };

    await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: newYorkLocation.lat,
      lng: newYorkLocation.lng,
      private: false,
    });

    const roomsFound = await sut.execute({
      lat: fiveKmAwayFromLocation.lat,
      lng: fiveKmAwayFromLocation.lng,
      max_distance: 5000,
    });

    expect(roomsFound).toHaveLength(1);
    expect(roomsFound[0].name).toEqual('0000 0000 0001');
    expect(roomsFound[0].lat).toEqual(newYorkLocation.lat);
    expect(roomsFound[0].lng).toEqual(newYorkLocation.lng);
    expect(roomsFound[0].private).toEqual(false);
    expect(roomsFound[0].status).toEqual('OPEN');
  });

  it('should be able to find all rooms by location within 20km', async () => {
    const newYorkLocation = {
      lat: 40.7128,
      lng: -74.006,
    };

    const twentyKmAwayFromLocation = {
      lat: 40.8003,
      lng: -73.806,
    };

    await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: newYorkLocation.lat,
      lng: newYorkLocation.lng,
      private: false,
    });

    const roomsFound = await sut.execute({
      lat: twentyKmAwayFromLocation.lat,
      lng: twentyKmAwayFromLocation.lng,
      max_distance: 20000,
    });

    expect(roomsFound).toHaveLength(1);
    expect(roomsFound[0].name).toEqual('0000 0000 0001');
    expect(roomsFound[0].lat).toEqual(newYorkLocation.lat);
    expect(roomsFound[0].lng).toEqual(newYorkLocation.lng);
    expect(roomsFound[0].private).toEqual(false);
    expect(roomsFound[0].status).toEqual('OPEN');
  });

  it('should be able to find all rooms by location within 50km', async () => {
    const newYorkLocation = {
      lat: 40.7128,
      lng: -74.006,
    };

    const fiftyKmAwayFromLocation = {
      lat: 41.0825,
      lng: -73.6699,
    };

    await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: newYorkLocation.lat,
      lng: newYorkLocation.lng,
      private: false,
    });

    const roomsFound = await sut.execute({
      lat: fiftyKmAwayFromLocation.lat,
      lng: fiftyKmAwayFromLocation.lng,
      max_distance: 50000,
    });

    expect(roomsFound).toHaveLength(1);
    expect(roomsFound[0].name).toEqual('0000 0000 0001');
    expect(roomsFound[0].lat).toEqual(newYorkLocation.lat);
    expect(roomsFound[0].lng).toEqual(newYorkLocation.lng);
    expect(roomsFound[0].private).toEqual(false);
    expect(roomsFound[0].status).toEqual('OPEN');
  });

  it('should not be able to find rooms more than 100 m away', async () => {
    const newYorkLocation = {
      lat: 40.7128,
      lng: -74.006,
    };

    const moreThanHundredMAwayFromLocation = {
      lat: 40.7138,
      lng: -74.006,
    };

    const totalCountRoomsBeforeCreation = await roomsRepository.totalCount();

    expect(totalCountRoomsBeforeCreation).toBe(0);

    await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: newYorkLocation.lat,
      lng: newYorkLocation.lng,
      private: false,
    });

    const totalCountRoomsAfterCreation = await roomsRepository.totalCount();

    expect(totalCountRoomsAfterCreation).toBe(1);

    const roomsFound = await sut.execute({
      lat: moreThanHundredMAwayFromLocation.lat,
      lng: moreThanHundredMAwayFromLocation.lng,
      max_distance: 100,
    });

    expect(roomsFound).toHaveLength(0);
  });

  it('should not be able to find rooms more than 1 km away', async () => {
    const newYorkLocation = {
      lat: 40.7128,
      lng: -74.006,
    };

    const moreThanOneKmAwayFromLocation = {
      lat: 40.725013,
      lng: -74.006,
    };

    const totalCountRoomsBeforeCreation = await roomsRepository.totalCount();

    expect(totalCountRoomsBeforeCreation).toBe(0);

    await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: newYorkLocation.lat,
      lng: newYorkLocation.lng,
      private: false,
    });

    const totalCountRoomsAfterCreation = await roomsRepository.totalCount();

    expect(totalCountRoomsAfterCreation).toBe(1);

    const roomsFound = await sut.execute({
      lat: moreThanOneKmAwayFromLocation.lat,
      lng: moreThanOneKmAwayFromLocation.lng,
      max_distance: 1000,
    });

    expect(roomsFound).toHaveLength(0);
  });

  it('should not be able to find rooms more than 5 km away', async () => {
    const newYorkLocation = {
      lat: 40.7128,
      lng: -74.006,
    };

    const moreThanFiveKmAwayFromLocation = {
      lat: 40.757,
      lng: -74.066,
    };

    const totalCountRoomsBeforeCreation = await roomsRepository.totalCount();

    expect(totalCountRoomsBeforeCreation).toBe(0);

    await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: newYorkLocation.lat,
      lng: newYorkLocation.lng,
      private: false,
    });

    const totalCountRoomsAfterCreation = await roomsRepository.totalCount();

    expect(totalCountRoomsAfterCreation).toBe(1);

    const roomsFound = await sut.execute({
      lat: moreThanFiveKmAwayFromLocation.lat,
      lng: moreThanFiveKmAwayFromLocation.lng,
      max_distance: 5000,
    });

    expect(roomsFound).toHaveLength(0);
  });

  it('should not be able to find rooms more than 20 km away', async () => {
    const newYorkLocation = {
      lat: 40.7128,
      lng: -74.006,
    };

    const moreThanTwentyKmAwayFromLocation = {
      lat: 40.8003,
      lng: -73.751,
    };

    const totalCountRoomsBeforeCreation = await roomsRepository.totalCount();

    expect(totalCountRoomsBeforeCreation).toBe(0);

    await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: newYorkLocation.lat,
      lng: newYorkLocation.lng,
      private: false,
    });

    const totalCountRoomsAfterCreation = await roomsRepository.totalCount();

    expect(totalCountRoomsAfterCreation).toBe(1);

    const roomsFound = await sut.execute({
      lat: moreThanTwentyKmAwayFromLocation.lat,
      lng: moreThanTwentyKmAwayFromLocation.lng,
      max_distance: 20000,
    });

    expect(roomsFound).toHaveLength(0);
  });

  it('should not be able to find rooms more than 50 km away', async () => {
    const newYorkLocation = {
      lat: 40.7128,
      lng: -74.006,
    };

    const moreThanFiftyKmAwayFromLocation = {
      lat: 40.8003,
      lng: -73.4115,
    };

    const totalCountRoomsBeforeCreation = await roomsRepository.totalCount();

    expect(totalCountRoomsBeforeCreation).toBe(0);

    await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: newYorkLocation.lat,
      lng: newYorkLocation.lng,
      private: false,
    });

    const totalCountRoomsAfterCreation = await roomsRepository.totalCount();

    expect(totalCountRoomsAfterCreation).toBe(1);

    const roomsFound = await sut.execute({
      lat: moreThanFiftyKmAwayFromLocation.lat,
      lng: moreThanFiftyKmAwayFromLocation.lng,
      max_distance: 50000,
    });

    expect(roomsFound).toHaveLength(0);
  });
});
