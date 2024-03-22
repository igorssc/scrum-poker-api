import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ExampleEvent } from '../websockets/events/enter-room';
import { UpdateUserService } from '@/application/use-cases/users/update-user.service';
import { UpdateUserDto } from '../dtos/users/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private exampleEvent: ExampleEvent,

    private updateUserService: UpdateUserService,
  ) {}

  @Patch(':userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() body: UpdateUserDto,
  ) {
    const { user } = await this.updateUserService.execute(userId, {
      name: body.name,
    });

    return user;
  }
}
