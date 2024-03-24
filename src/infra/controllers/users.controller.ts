import { Body, Controller, Param, Patch } from '@nestjs/common';
import { UpdateUserService } from '@/application/use-cases/users/update-user.service';
import { UpdateUserDto } from '../dtos/users/update-user.dto';
import { UpdateUserEvent } from '../websockets/events/update-user.event';
import { StatusRoom } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(
    private updateUserService: UpdateUserService,
    private updateUserEvent: UpdateUserEvent,
  ) {}

  @Patch(':userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() body: UpdateUserDto,
  ) {
    const { user } = await this.updateUserService.execute(userId, {
      name: body.name,
    });

    user.rooms.map((room) => {
      if (room.status === StatusRoom.OPEN) {
        this.updateUserEvent.send(room.id, {
          id: user.id,
          name: user.name,
          created_at: user.created_at,
        });
      }
    });

    return user;
  }
}
