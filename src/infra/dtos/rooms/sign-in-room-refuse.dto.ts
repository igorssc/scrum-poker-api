import { IsString } from 'class-validator';
import {
  ACCESS_ROOM_ERROR_MESSAGE,
  OWNER_ID_ERROR_MESSAGE,
  USER_ID_ERROR_MESSAGE,
} from '@/application/errors/validations.constants';

export abstract class SignInRoomRefuseDto {
  @IsString({ message: OWNER_ID_ERROR_MESSAGE })
  owner_id: string;

  @IsString({ message: USER_ID_ERROR_MESSAGE })
  user_id: string;

  @IsString({ message: ACCESS_ROOM_ERROR_MESSAGE })
  access: string;
}
