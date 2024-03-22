import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WebSocketGateway } from '../gateways/events.gateway';
import { WebSocketGatewayDecorator } from '@/infra/decorators/web-socket-gateway.decorator';

@Injectable()
@WebSocketGatewayDecorator()
export class ExampleEvent {
  constructor(private webSocketGateway: WebSocketGateway) {}

  @SubscribeMessage('msg')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handle(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log('Received data:', data);

    this.webSocketGateway.server.emit('msgReceived', data + 'teste');
  }
}
