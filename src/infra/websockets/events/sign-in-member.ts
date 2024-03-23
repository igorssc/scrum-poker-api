import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../gateways/events.gateway';
import { WebSocketGatewayDecorator } from '@/infra/decorators/web-socket-gateway.decorator';
import { Member, User } from '@prisma/client';

interface SendProps {
  user: User;
  member: Member;
}

@Injectable()
@WebSocketGatewayDecorator()
export class SignInEvent {
  constructor(private webSocketGateway: WebSocketGateway) {}

  send(roomId: string, data: SendProps) {
    this.webSocketGateway.server.emit(roomId, {
      type: 'sign-in',
      data: { user: { ...data.user, status: data.member.status } },
    });
  }
}
