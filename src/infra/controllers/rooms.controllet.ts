import { Body, Controller, HttpCode, Patch, Post } from '@nestjs/common';
import { ExampleEvent } from '../websockets/events/enter-room';
import { CreateRoomDto } from '../dtos/rooms/create-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private exampleEvent: ExampleEvent) {}

  @Post()
  @HttpCode(201)
  async createRoom(@Body() body: CreateRoomDto) {
    console.log(body);
    this.exampleEvent.handle(body.name, null);
  }

  @Patch()
  @HttpCode(201)
  async updateRoom(@Body() body: any) {
    console.log(body);

    this.exampleEvent.handle('test', null);
  }
}
