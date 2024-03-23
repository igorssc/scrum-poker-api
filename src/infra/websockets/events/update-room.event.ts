import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '../gateways/events.gateway';
import { WebSocketGatewayDecorator } from '@/infra/decorators/web-socket-gateway.decorator';
import { Room } from '@prisma/client';

@Injectable()
@WebSocketGatewayDecorator()
export class UpdateRoomEvent {
  constructor(private webSocketGateway: WebSocketGateway) {}

  send(roomId: string, data: Room) {
    this.webSocketGateway.server.emit(roomId, {
      type: 'update-room',
      data: { room: data },
    });
  }
}
