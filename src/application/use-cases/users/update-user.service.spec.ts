import { UsersRepository } from '@/application/repositories/users.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserService } from './update-user.service';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryUsersRepository } from '@/application/repositories/implementations/in-memory/users.repository';

describe('Update User Use Case', () => {
  let usersRepository: UsersRepository;
  let sut: UpdateUserService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserService,
        { provide: UsersRepository, useClass: InMemoryUsersRepository },
      ],
    }).compile();

    usersRepository = moduleRef.get(UsersRepository);
    sut = moduleRef.get(UpdateUserService);
  });

  it('should be able to update a user', async () => {
    const userCreated = await usersRepository.create({
      name: 'John Doe',
    });

    const { user: userChanged } = await sut.execute(userCreated.id, {
      name: 'Alice Smith',
    });

    expect(userChanged.id).toEqual(userCreated.id);

    expect(userChanged.name).toEqual('Alice Smith');
  });

  it('should not be able to update a user with a lowercase name', async () => {
    const userCreated = await usersRepository.create({
      name: 'John Doe',
    });

    const { user: userChanged } = await sut.execute(userCreated.id, {
      name: 'peter',
    });

    expect(userChanged.name).toEqual('Peter');
  });
});
