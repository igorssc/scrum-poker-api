import { IsString } from 'class-validator';
import { USER_ID_ERROR_MESSAGE } from '@/application/errors/validations.constants';

export abstract class VoteRoomDto {
  @IsString({ message: USER_ID_ERROR_MESSAGE })
  user_id: string;

  @IsString({ message: USER_ID_ERROR_MESSAGE })
  vote: string;
}
