import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../gateways/events.gateway';
import { EventsEnum } from '@/infra/enums/events.enum';

@Injectable()
export class DeleteRoomEvent {
  constructor(private webSocketGateway: WebSocketGateway) {}

  send(roomId: string) {
    this.webSocketGateway.server.emit(roomId, {
      type: EventsEnum.DELETE_ROOM,
      data: null,
    });
  }
}
