import { INVALID_PARAMS } from '@/application/errors/errors.constants';
import { UsersRepository } from '@/application/repositories/users.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { isUUID } from 'class-validator';

interface FindUniqueUserUseCaseResponse {
  user: User;
}

@Injectable()
export class FindUniqueUserService {
  constructor(private usersRepository: UsersRepository) {}

  async execute(query: string): Promise<FindUniqueUserUseCaseResponse> {
    if (isUUID(query)) {
      const user = await this.usersRepository.findById(query);

      return { user };
    }

    throw new BadRequestException(INVALID_PARAMS);
  }
}
