import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../gateways/events.gateway';
import { WebSocketGatewayDecorator } from '@/infra/decorators/web-socket-gateway.decorator';
import { Member } from '@prisma/client';
import { EventsEnum } from '@/infra/enums/events.enum';

@Injectable()
@WebSocketGatewayDecorator()
export class SignInRefuseEvent {
  constructor(private webSocketGateway: WebSocketGateway) {}

  send(roomId: string, data: Member) {
    // data = Member include User

    this.webSocketGateway.server.emit(roomId, {
      type: EventsEnum.SIGN_IN_REFUSE,
      data: { user: data },
    });
  }
}
