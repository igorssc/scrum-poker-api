import { WebSocketGatewayDecorator } from '@/infra/decorators/web-socket-gateway.decorator';
import { Injectable } from '@nestjs/common';
import {
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGatewayDecorator()
export class WebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    server.on('connection', (socket) => {
      socket.emit('server-info', {
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        transport: socket.conn.transport.name,
        upgraded: socket.conn.upgraded,
      });
    });
  }

  handleConnection(client: Socket) {
    client.emit('connection-success', {
      clientId: client.id,
      transport: client.conn.transport.name,
      timestamp: new Date().toISOString(),
    });

    client.conn.on('upgrade', () => {});

    client.conn.on('upgradeError', (error) => {});
  }

  handleDisconnect(client: Socket) {}
}
