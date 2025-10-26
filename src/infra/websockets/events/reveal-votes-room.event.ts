import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class RevealVotesEvent {
  constructor(private readonly io: Server) {}

  send(roomId: string, room: any) {
    this.io.to(roomId).emit('votesRevealed', { room });
  }
}
