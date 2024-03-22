import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import {
  LATITUDE_MAX_ERROR_MESSAGE,
  LATITUDE_MIN_ERROR_MESSAGE,
  LATITUDE_NUMBER_ERROR_MESSAGE,
  LONGITUDE_MAX_ERROR_MESSAGE,
  LONGITUDE_MIN_ERROR_MESSAGE,
  LONGITUDE_NUMBER_ERROR_MESSAGE,
  NAME_ERROR_MESSAGE,
} from '@/application/errors/validations.constants';

export abstract class UpdateRoomDto {
  @IsString({ message: NAME_ERROR_MESSAGE })
  name: string;

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
}
