import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../gateways/events.gateway';
import { EventsEnum } from '@/infra/enums/events.enum';

@Injectable()
export class ClearVotesEvent {
  constructor(private webSocketGateway: WebSocketGateway) {}

  send(roomId: string) {
    this.webSocketGateway.server.emit(roomId, {
      type: EventsEnum.CLEAR_VOTES,
      data: null,
    });
  }
}
