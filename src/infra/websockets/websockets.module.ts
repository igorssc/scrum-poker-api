import { Module } from '@nestjs/common';
import { WebSocketGateway } from './gateways/events.gateway';
import { SignInEvent } from './events/sign-in-member.event';
import { SignOutEvent } from './events/sign-out-member.event';
import { VoteEvent } from './events/vote-room.event';

@Module({
  providers: [WebSocketGateway, SignInEvent, SignOutEvent, VoteEvent],
  exports: [SignInEvent, SignOutEvent, VoteEvent],
})
export class WebSocketModule {}
