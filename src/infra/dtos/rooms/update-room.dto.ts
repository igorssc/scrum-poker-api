import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  IsArray,
  IsDateString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  LATITUDE_MAX_ERROR_MESSAGE,
  LATITUDE_MIN_ERROR_MESSAGE,
  LATITUDE_NUMBER_ERROR_MESSAGE,
  LONGITUDE_MAX_ERROR_MESSAGE,
  LONGITUDE_MIN_ERROR_MESSAGE,
  LONGITUDE_NUMBER_ERROR_MESSAGE,
  NAME_ERROR_MESSAGE,
  PRIVATE_ROOM_ERROR_MESSAGE,
  ROOM_NAME_MIN_LENGTH_ERROR_MESSAGE,
  THEME_ERROR_MESSAGE,
} from '@/application/errors/validations.constants';

export abstract class UpdateRoomDto {
  @IsOptional()
  @IsString({ message: NAME_ERROR_MESSAGE })
  @MinLength(3, { message: ROOM_NAME_MIN_LENGTH_ERROR_MESSAGE })
  name?: string;

  @IsOptional()
  @IsString({ message: THEME_ERROR_MESSAGE })
  theme?: string;

  @IsOptional()
  @IsNumber({}, { message: LATITUDE_NUMBER_ERROR_MESSAGE })
  @Min(-90, { message: LATITUDE_MIN_ERROR_MESSAGE })
  @Max(90, { message: LATITUDE_MAX_ERROR_MESSAGE })
  @Type(() => Number)
  lat?: number;

  @IsOptional()
  @IsNumber({}, { message: LONGITUDE_NUMBER_ERROR_MESSAGE })
  @Min(-180, { message: LONGITUDE_MIN_ERROR_MESSAGE })
  @Max(180, { message: LONGITUDE_MAX_ERROR_MESSAGE })
  @Type(() => Number)
  lng?: number;

  @IsOptional()
  @IsBoolean({ message: PRIVATE_ROOM_ERROR_MESSAGE })
  @Type(() => Boolean)
  private?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  who_can_edit?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  who_can_open_cards?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  who_can_aprove_entries?: string[];

  @IsOptional()
  @IsDateString()
  start_timer?: Date;

  @IsOptional()
  @IsDateString()
  stop_timer?: Date;
}
