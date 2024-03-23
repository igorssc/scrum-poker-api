import { Module } from '@nestjs/common';
import { WebSocketGateway } from './gateways/events.gateway';
import { SignInEvent } from './events/sign-in-member';
import { SignOutEvent } from './events/sign-out-member';

@Module({
  providers: [WebSocketGateway, SignInEvent, SignOutEvent],
  exports: [SignInEvent, SignOutEvent],
})
export class WebSocketModule {}
