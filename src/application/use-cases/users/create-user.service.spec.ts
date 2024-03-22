import { UsersRepository } from '@/application/repositories/users.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserService } from './create-user.service';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryUsersRepository } from '@/application/repositories/implementations/in-memory/users.repository';

describe('Create User Use Case', () => {
  let sut: CreateUserService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserService,
        { provide: UsersRepository, useClass: InMemoryUsersRepository },
      ],
    }).compile();

    sut = moduleRef.get(CreateUserService);
  });

  it('should be able to register', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.name).toEqual('John Doe');
  });

  it('should not be able to create a user with a lowercase name', async () => {
    const { user: userCreated } = await sut.execute({
      name: 'john doe',
    });

    expect(userCreated.name).toBe('John Doe');
  });
});
