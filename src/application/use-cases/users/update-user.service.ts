import { UsersRepository } from '@/application/repositories/users.repository';
import { capitalizeInitials } from '@/application/utils/capitalize-initials';
import { Injectable } from '@nestjs/common';
import { Room, User } from '@prisma/client';

interface UpdateUserUseCaseResponse {
  user: UserWithRooms;
}

interface UpdateUserDataProps {
  name: string;
}

type UserWithRooms = User & { rooms: Room[] };

@Injectable()
export class UpdateUserService {
  constructor(private usersRepository: UsersRepository) {}

  async execute(
    userId: string,
    data: UpdateUserDataProps,
  ): Promise<UpdateUserUseCaseResponse> {
    const userUpdated = await this.usersRepository.update(userId, {
      name: capitalizeInitials(data.name),
    });

    const userFound = (await this.usersRepository.findById(
      userUpdated.id,
      true,
    )) as UserWithRooms;

    return { user: userFound };
  }
}
