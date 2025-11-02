import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../gateways/events.gateway';
import { EventsEnum } from '@/infra/enums/events.enum';

@Injectable()
export class SignOutEvent {
  constructor(private webSocketGateway: WebSocketGateway) {}

  send(roomId: string, userId: string) {
    this.webSocketGateway.server.emit(roomId, {
      type: EventsEnum.SIGN_OUT,
      data: { user: { id: userId } },
    });
  }
}
