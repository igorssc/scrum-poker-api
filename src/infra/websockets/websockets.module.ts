import { Module } from '@nestjs/common';
import { WebSocketGateway } from './gateways/events.gateway';
import { SignInEvent } from './events/sign-in-member.event';
import { SignOutEvent } from './events/sign-out-member.event';
import { VoteEvent } from './events/vote-room.event';
import { UpdateRoomEvent } from './events/update-room.event';
import { SignInAcceptEvent } from './events/sign-in-accept-member.event';

@Module({
  providers: [
    WebSocketGateway,
    SignInEvent,
    SignOutEvent,
    VoteEvent,
    UpdateRoomEvent,
    SignInAcceptEvent,
  ],
  exports: [
    SignInEvent,
    SignOutEvent,
    VoteEvent,
    UpdateRoomEvent,
    SignInAcceptEvent,
  ],
})
export class WebSocketModule {}
