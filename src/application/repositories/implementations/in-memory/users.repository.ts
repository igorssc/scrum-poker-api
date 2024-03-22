import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { UsersRepository } from '../../users.repository';

@Injectable()
export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = [];

  async create(data: Prisma.UserCreateInput) {
    const userCreated = {
      id: randomUUID(),
      name: data.name,
      created_at: new Date(),
    };

    this.items.push(userCreated);

    return userCreated;
  }

  async findById(id: string) {
    const user = this.items.find((item) => item.id === id);

    if (!user) {
      return null;
    }

    return { ...user };
  }

  async totalCount() {
    return this.items.length;
  }

  async update(userId: string, user: Prisma.UserUpdateInput) {
    const userIndex = this.items.findIndex((item) => item.id === userId);

    if (userIndex < 0) {
      return null;
    }

    Object.assign(this.items[userIndex], user);

    return { ...this.items[userIndex] };
  }

  async deleteUnique(userId: string) {
    const userIndex = this.items.findIndex((item) => item.id === userId);

    if (userIndex < 0) {
      return null;
    }

    const userDeleted = { ...this.items[userIndex] };

    this.items.splice(userIndex, 1);

    return userDeleted;
  }
}
