import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../gateways/events.gateway';
import { WebSocketGatewayDecorator } from '@/infra/decorators/web-socket-gateway.decorator';
import { EventsEnum } from '@/infra/enums/events.enum';

@Injectable()
@WebSocketGatewayDecorator()
export class ClearVotesEvent {
  constructor(private webSocketGateway: WebSocketGateway) {}

  send(roomId: string) {
    this.webSocketGateway.server.emit(roomId, {
      type: EventsEnum.CLEAR_VOTES,
      data: null,
    });
  }
}
