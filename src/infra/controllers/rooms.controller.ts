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
import { CreateRoomService } from '@/application/use-cases/rooms/create-room.service';
import { UpdateRoomService } from '@/application/use-cases/rooms/update-room.service';

@Controller('rooms')
export class RoomsController {
  constructor(
    private exampleEvent: ExampleEvent,

    private createRoomService: CreateRoomService,
    private updateRoomService: UpdateRoomService,
  ) {}

  @Get('/location')
  async findByLocation(@Query() query: FindRoomsByLocationDto) {
    const { lat, lng, max_distance } = query;
  }

  @Post()
  @HttpCode(201)
  async createRoom(@Body() body: CreateRoomDto) {
    const { room } = await this.createRoomService.execute(body);

    return room;
  }

  @Post('sign-out')
  async signOut(@Body() body: SignOutRoomDto) {}

  @Post('sign-in')
  async signIn(@Body() body: SignInRoomDto) {}

  @Post('sign-in/accept')
  async signInAccept(@Body() body: SignInRoomAcceptDto) {}

  @Patch('roomId')
  async updateRoom(
    @Param('roomId') roomId: string,
    @Body() body: UpdateRoomDto,
  ) {
    const { room } = await this.updateRoomService.execute(roomId, body);

    return room;
  }

  @Delete(':roomId')
  async deleteUnique(@Param('roomId') roomId: string) {}
}
