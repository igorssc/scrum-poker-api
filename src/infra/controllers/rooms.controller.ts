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

@Controller('rooms')
export class RoomsController {
  constructor(private exampleEvent: ExampleEvent) {}

  @Get('/location')
  async findByLocation(@Query() query: FindRoomsByLocationDto) {
    const { lat, lng, max_distance } = query;
  }

  @Post()
  @HttpCode(201)
  async createRoom(@Body() body: CreateRoomDto) {}

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
