import { UsersRepository } from '@/application/repositories/users.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { FindUniqueUserService } from './find-unique-user.service';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryUsersRepository } from '@/application/repositories/implementations/in-memory/users.repository';
import { BadRequestException } from '@nestjs/common';

describe('Find Unique User Use Case', () => {
  let usersRepository: UsersRepository;
  let sut: FindUniqueUserService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindUniqueUserService,
        { provide: UsersRepository, useClass: InMemoryUsersRepository },
      ],
    }).compile();

    usersRepository = moduleRef.get(UsersRepository);
    sut = moduleRef.get(FindUniqueUserService);
  });

  it('should be able to find a specific user by id', async () => {
    const userCreated = await usersRepository.create({
      name: 'John Doe',
    });

    const { user } = await sut.execute(userCreated.id);

    expect(user).toHaveProperty('name');

    expect(user.name).toBe('John Doe');
  });

  it('should not be able to find a non-existent user', async () => {
    expect(sut.execute('test')).rejects.toThrow(BadRequestException);
  });
});
