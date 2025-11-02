import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../gateways/events.gateway';
import { Room } from '@prisma/client';
import { EventsEnum } from '@/infra/enums/events.enum';

@Injectable()
export class UpdateRoomEvent {
  constructor(private webSocketGateway: WebSocketGateway) {}

  send(roomId: string, data: Room) {
    this.webSocketGateway.server.emit(roomId, {
      type: EventsEnum.UPDATE_ROOM,
      data: { room: data },
    });
  }
}
