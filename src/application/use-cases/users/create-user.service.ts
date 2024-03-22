import { UsersRepository } from '@/application/repositories/users.repository';
import { capitalizeInitials } from '@/application/utils/capitalize-initials';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

interface CreateUserUseCaseResponse {
  user: User;
}

interface CreateUserDataProps {
  name: string;
}

@Injectable()
export class CreateUserService {
  constructor(private usersRepository: UsersRepository) {}

  async execute(data: CreateUserDataProps): Promise<CreateUserUseCaseResponse> {
    const { name } = data;

    const userCreated = await this.usersRepository.create({
      name: capitalizeInitials(name),
    });

    return { user: userCreated };
  }
}
