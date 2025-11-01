import { IsString } from 'class-validator';
import {
  ACCESS_ROOM_ERROR_MESSAGE,
  USER_ID_ERROR_MESSAGE,
} from '@/application/errors/validations.constants';

export abstract class SignInRoomRefuseDto {
  @IsString({ message: USER_ID_ERROR_MESSAGE })
  user_action_id: string;

  @IsString({ message: USER_ID_ERROR_MESSAGE })
  user_id: string;

  @IsString({ message: ACCESS_ROOM_ERROR_MESSAGE })
  access: string;
}
