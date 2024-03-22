import { Module } from '@nestjs/common';
import { WebSocketGateway } from './gateways/events.gateway';
import { ExampleEvent } from './events/enter-room';

@Module({
  providers: [WebSocketGateway, ExampleEvent],
  exports: [ExampleEvent],
})
export class WebSocketModule {}
