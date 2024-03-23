import { IsString } from 'class-validator';
import {
  ROOM_ID_ERROR_MESSAGE,
  USER_ACTION_ID_ERROR_MESSAGE,
  USER_ID_ERROR_MESSAGE,
} from '@/application/errors/validations.constants';

export abstract class SignOutRoomDto {
  @IsString({ message: USER_ACTION_ID_ERROR_MESSAGE })
  user_action_id: string;

  @IsString({ message: USER_ID_ERROR_MESSAGE })
  user_id: string;

  @IsString({ message: ROOM_ID_ERROR_MESSAGE })
  room_id: string;
}
