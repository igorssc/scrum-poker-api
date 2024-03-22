import { IsOptional, IsString } from 'class-validator';
import {
  ACCESS_ROOM_ERROR_MESSAGE,
  ROOM_ID_ERROR_MESSAGE,
  USER_ID_ERROR_MESSAGE,
  USER_NAME_ERROR_MESSAGE,
} from '@/application/errors/validations.constants';

export abstract class SignInRoomDto {
  @IsOptional()
  @IsString({ message: USER_ID_ERROR_MESSAGE })
  user_id?: string;

  @IsString({ message: USER_NAME_ERROR_MESSAGE })
  user_name: string;

  @IsString({ message: ROOM_ID_ERROR_MESSAGE })
  room_id: string;

  @IsOptional()
  @IsString({ message: ACCESS_ROOM_ERROR_MESSAGE })
  access?: string;
}
