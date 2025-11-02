import {
  INVALID_PARAMS,
  USER_NOT_FOUND,
} from '@/application/errors/errors.constants';
import { UsersRepository } from '@/application/repositories/users.repository';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { isUUID } from 'class-validator';

interface FindUniqueUserUseCaseResponse {
  user: User;
}

@Injectable()
export class FindUniqueUserService {
  constructor(private usersRepository: UsersRepository) {}

  async execute(query: string): Promise<FindUniqueUserUseCaseResponse> {
    if (!isUUID(query)) {
      throw new BadRequestException(INVALID_PARAMS);
    }

    const user = await this.usersRepository.findById(query);

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    return { user };
  }
}
