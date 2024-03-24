import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../gateways/events.gateway';
import { WebSocketGatewayDecorator } from '@/infra/decorators/web-socket-gateway.decorator';
import { User } from '@prisma/client';
import { EventsEnum } from '@/infra/enums/events.enum';

@Injectable()
@WebSocketGatewayDecorator()
export class UpdateUserEvent {
  constructor(private webSocketGateway: WebSocketGateway) {}

  send(roomId: string, data: User) {
    this.webSocketGateway.server.emit(roomId, {
      type: EventsEnum.UPDATE_USER,
      data: { user: data },
    });
  }
}
