import { UsersRepository } from '@/application/repositories/users.repository';
import { capitalizeInitials } from '@/application/utils/capitalize-initials';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

interface UpdateUserUseCaseResponse {
  user: User;
}

interface UpdateUserDataProps {
  userId: string;
  name: string;
}

@Injectable()
export class UpdateUserService {
  constructor(private usersRepository: UsersRepository) {}

  async execute(data: UpdateUserDataProps): Promise<UpdateUserUseCaseResponse> {
    const { name, userId } = data;

    const userUpdated = await this.usersRepository.update(userId, {
      name: capitalizeInitials(name),
    });

    return { user: userUpdated };
  }
}
