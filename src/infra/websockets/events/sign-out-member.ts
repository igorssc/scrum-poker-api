import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../gateways/events.gateway';
import { WebSocketGatewayDecorator } from '@/infra/decorators/web-socket-gateway.decorator';

@Injectable()
@WebSocketGatewayDecorator()
export class SignOutEvent {
  constructor(private webSocketGateway: WebSocketGateway) {}

  send(roomId: string, memberId: string) {
    this.webSocketGateway.server.emit(roomId, {
      type: 'sign-out',
      data: { user: { id: memberId } },
    });
  }
}
