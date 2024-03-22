import { IsString } from 'class-validator';
import {
  OWNER_ID_ERROR_MESSAGE,
  ROOM_ID_ERROR_MESSAGE,
  USER_ID_ERROR_MESSAGE,
} from '@/application/errors/validations.constants';

export abstract class SignInRoomAcceptDto {
  @IsString({ message: OWNER_ID_ERROR_MESSAGE })
  owner_id: string;

  @IsString({ message: USER_ID_ERROR_MESSAGE })
  user_id: string;

  @IsString({ message: ROOM_ID_ERROR_MESSAGE })
  room_id: string;
}
