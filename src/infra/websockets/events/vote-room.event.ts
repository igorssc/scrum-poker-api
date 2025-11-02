import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../gateways/events.gateway';
import { Member } from '@prisma/client';
import { EventsEnum } from '@/infra/enums/events.enum';

@Injectable()
export class VoteEvent {
  constructor(private webSocketGateway: WebSocketGateway) {}

  send(roomId: string, data: Member) {
    // data = Member include User

    this.webSocketGateway.server.emit(roomId, {
      type: EventsEnum.VOTE_MEMBER,
      data: { user: data },
    });
  }
}
