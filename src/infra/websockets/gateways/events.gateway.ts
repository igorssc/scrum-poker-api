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
    console.log('WebSocket Gateway initialized');
    server.setMaxListeners(20); // Increase max listeners to prevent warnings
  }

  handleConnection(client: Socket) {
    client.emit('connection-success', {
      clientId: client.id,
      transport: client.conn.transport.name,
      timestamp: new Date().toISOString(),
    });

    client.emit('server-info', {
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      transport: client.conn.transport.name,
      upgraded: client.conn.upgraded,
    });

    client.conn.on('upgrade', () => {});

    client.conn.on('upgradeError', (_error) => {});
  }

  handleDisconnect(_client: Socket) {}
}
