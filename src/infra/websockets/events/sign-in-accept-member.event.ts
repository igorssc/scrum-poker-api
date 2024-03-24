import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../gateways/events.gateway';
import { WebSocketGatewayDecorator } from '@/infra/decorators/web-socket-gateway.decorator';
import { Member } from '@prisma/client';

@Injectable()
@WebSocketGatewayDecorator()
export class SignInAcceptEvent {
  constructor(private webSocketGateway: WebSocketGateway) {}

  send(roomId: string, data: Member) {
    // data = Member include User

    this.webSocketGateway.server.emit(roomId, {
      type: 'sign-in-accept',
      data: { user: data },
    });
  }
}
