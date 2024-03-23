import { Module } from '@nestjs/common';
import { WebSocketGateway } from './gateways/events.gateway';
import { SignInEvent } from './events/sign-in-member.event';
import { SignOutEvent } from './events/sign-out-member.event';
import { VoteEvent } from './events/vote-room.event';
import { UpdateRoomEvent } from './events/update-room.event';

@Module({
  providers: [
    WebSocketGateway,
    SignInEvent,
    SignOutEvent,
    VoteEvent,
    UpdateRoomEvent,
  ],
  exports: [SignInEvent, SignOutEvent, VoteEvent, UpdateRoomEvent],
})
export class WebSocketModule {}
