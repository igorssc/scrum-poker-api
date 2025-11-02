import { WebSocketGateway } from '@nestjs/websockets';

export const WebSocketGatewayDecorator = () =>
  WebSocketGateway({
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? ['https://scrumpoker.dev.br'] // Replace with your actual frontend domain
          : '*',
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'], // Allow both transports for better compatibility
    allowEIO3: true, // Support older socket.io clients
    upgrade: true,
    rememberUpgrade: true,
  });
