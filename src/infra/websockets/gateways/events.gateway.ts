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
    console.log('WebSocket initialized');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    
    // Health check endpoint via WebSocket
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
    console.log(`Client connected: ${client.id}`);
    console.log(`Transport: ${client.conn.transport.name}`);
    console.log(`User Agent: ${client.handshake.headers['user-agent']}`);
    console.log(`Origin: ${client.handshake.headers.origin}`);
    
    // Send welcome message
    client.emit('connection-success', {
      clientId: client.id,
      transport: client.conn.transport.name,
      timestamp: new Date().toISOString(),
    });

    // Monitor transport upgrades
    client.conn.on('upgrade', () => {
      console.log(`Client ${client.id} upgraded to: ${client.conn.transport.name}`);
    });

    client.conn.on('upgradeError', (error) => {
      console.error(`Client ${client.id} upgrade error:`, error);
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    console.log(`Disconnect reason: ${client.disconnected}`);
  }
}
