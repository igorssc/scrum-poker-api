import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ExampleEvent } from '../websockets/events/enter-room';
import { CreateRoomDto } from '../dtos/rooms/create-room.dto';
import { UpdateRoomDto } from '../dtos/rooms/update-room.dto';
import { FindRoomsByLocationDto } from '../dtos/rooms/find-rooms-by-location.dto';
import { SignOutRoomDto } from '../dtos/rooms/sign-out-room.dto';
import { SignInRoomDto } from '../dtos/rooms/sign-in-room.dto';
import { SignInRoomAcceptDto } from '../dtos/rooms/sign-in-room-accept.dto';
import { CreateUserService } from '@/application/use-cases/users/create-user.service';
import { User } from '@prisma/client';
import {
  CreateRoomService,
  CreateRoomUseCaseResponse,
} from '@/application/use-cases/rooms/create-room.service';

@Controller('rooms')
export class RoomsController {
  constructor(
    private exampleEvent: ExampleEvent,
    private createUserService: CreateUserService,
    private createRoomService: CreateRoomService,
  ) {}

  @Get('/location')
  async findByLocation(@Query() query: FindRoomsByLocationDto) {
    const { lat, lng, max_distance } = query;
  }

  @Post()
  @HttpCode(201)
  async createRoom(
    @Body() body: CreateRoomDto,
  ): Promise<CreateRoomUseCaseResponse> {
    let user: User;

    if (!body.user_id) {
      const userCreated = await this.createUserService.execute({
        name: body.user_name,
      });

      user = userCreated.user;
    }

    const roomCreated = await this.createRoomService.execute({
      name: body.name,
      user_id: body.user_id || user.id,
      user_name: body.user_name,
      lat: body.lat,
      lng: body.lng,
    });

    return roomCreated;
  }

  @Post('sign-out')
  async signOut(@Body() body: SignOutRoomDto) {}

  @Post('sign-in')
  async signIn(@Body() body: SignInRoomDto) {}

  @Post('sign-in/accept')
  async signInAccept(@Body() body: SignInRoomAcceptDto) {}

  @Patch()
  async updateRoom(@Body() body: UpdateRoomDto) {}

  @Delete(':roomId')
  async deleteUnique(@Param('roomId') roomId: string) {}
}
