import { Injectable } from '@nestjs/common';
import { MembersRepository } from '@/application/repositories/members.repository';

interface CreateRoomServiceExecuteProps {
  roomId: string;
  memberId: string;
}

@Injectable()
export class CreateRoomService {
  constructor(private membersRepository: MembersRepository) {}

  async execute(data: CreateRoomServiceExecuteProps) {
    await this.membersRepository.deleteUnique(data);
  }
}
