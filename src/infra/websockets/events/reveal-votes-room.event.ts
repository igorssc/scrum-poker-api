import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../gateways/events.gateway';
import { EventsEnum } from '@/infra/enums/events.enum';
import { Room } from '@prisma/client';

@Injectable()
export class RevealVotesEvent {
  constructor(private webSocketGateway: WebSocketGateway) {}

  send(roomId: string, room: Room) {
    this.webSocketGateway.server.emit(roomId, {
      type: EventsEnum.VOTES_REVEALED,
      data: { room },
    });
  }
}
