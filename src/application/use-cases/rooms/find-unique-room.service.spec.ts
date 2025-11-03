import { RoomsRepository } from '@/application/repositories/rooms.repository';
import { MembersRepository } from '@/application/repositories/members.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryRoomsRepository } from '@/application/repositories/implementations/in-memory/rooms.repository';
import { InMemoryMembersRepository } from '@/application/repositories/implementations/in-memory/members.repository';
import { StatusRoom } from '@prisma/client';
import { FindUniqueRoomService } from './find-unique-room.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

describe('Find Unique Room Use Case', () => {
  let sut: FindUniqueRoomService;
  let roomsRepository: InMemoryRoomsRepository;
  let membersRepository: InMemoryMembersRepository;

  beforeEach(async () => {
    const inMemoryRoomsRepository = new InMemoryRoomsRepository();
    const inMemoryMembersRepository = new InMemoryMembersRepository();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindUniqueRoomService,
        { provide: RoomsRepository, useValue: inMemoryRoomsRepository },
        { provide: MembersRepository, useValue: inMemoryMembersRepository },
      ],
    }).compile();

    sut = moduleRef.get(FindUniqueRoomService);
    roomsRepository = moduleRef.get(RoomsRepository) as InMemoryRoomsRepository;
    membersRepository = moduleRef.get(
      MembersRepository,
    ) as InMemoryMembersRepository;

    // Conectar os repositórios para compartilhar dados
    inMemoryRoomsRepository.members = inMemoryMembersRepository.items;
  });

  it('should be able to find unique room', async () => {
    const roomCreated = await roomsRepository.create({
      name: '0000 0000 0001',
      owner: { connect: { id: 'user-id-test' } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    const { room: roomFound } = await sut.execute(roomCreated.id);

    expect(roomFound.id).toEqual(roomCreated.id);
    expect(roomFound.name).toEqual('0000 0000 0001');
  });

  it('should not be able to find a unique room non-existent', async () => {
    const roomFound = sut.execute(randomUUID());

    await expect(roomFound).rejects.toThrow(NotFoundException);
  });

  it('should not be able to find a unique room with an ID other than uuid', async () => {
    const roomFound = sut.execute('id-with-unknown-format');

    await expect(roomFound).rejects.toThrow(BadRequestException);
  });

  it('should remove inactive members (older than 2 days) but keep owner', async () => {
    const ownerId = 'owner-id-test';
    const inactiveMemberId = 'inactive-member-id';
    const activeMemberId = 'active-member-id';

    // Criar sala
    const roomCreated = await roomsRepository.create({
      name: 'Test Room',
      owner: { connect: { id: ownerId } },
      status: StatusRoom.OPEN,
      lat: null,
      lng: null,
      private: false,
      theme: 'theme-test',
    });

    // Criar membro inativo (mais de 2 dias)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    await membersRepository.create({
      member: { connect: { id: inactiveMemberId } },
      room: { connect: { id: roomCreated.id } },
      last_activity: threeDaysAgo,
    });

    // Criar membro ativo
    await membersRepository.create({
      member: { connect: { id: activeMemberId } },
      room: { connect: { id: roomCreated.id } },
      last_activity: new Date(),
    });

    // Criar membro owner (deve ser mantido mesmo se inativo)
    await membersRepository.create({
      member: { connect: { id: ownerId } },
      room: { connect: { id: roomCreated.id } },
      last_activity: threeDaysAgo,
    });

    // Executar o service
    const { room } = await sut.execute(roomCreated.id);

    // Verificar se o membro inativo foi removido
    const inactiveMember = await membersRepository.findByUserAndRoomId({
      userId: inactiveMemberId,
      roomId: roomCreated.id,
    });

    // Verificar se o membro ativo foi mantido
    const activeMember = await membersRepository.findByUserAndRoomId({
      userId: activeMemberId,
      roomId: roomCreated.id,
    });

    // Verificar se o owner foi mantido
    const ownerMember = await membersRepository.findByUserAndRoomId({
      userId: ownerId,
      roomId: roomCreated.id,
    });

    expect(inactiveMember).toBeNull(); // Removido
    expect(activeMember).not.toBeNull(); // Mantido
    expect(ownerMember).not.toBeNull(); // Owner mantido mesmo inativo
  });
});
