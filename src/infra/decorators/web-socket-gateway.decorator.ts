import { WebSocketGateway } from '@nestjs/websockets';

export const WebSocketGatewayDecorator = () =>
  WebSocketGateway({
    cors: { origin: '*' },
    pingTimeout: 30000,
    transports: ['websocket'],
  });
