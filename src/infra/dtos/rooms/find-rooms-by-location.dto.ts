import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import {
  LATITUDE_MAX_ERROR_MESSAGE,
  LATITUDE_MIN_ERROR_MESSAGE,
  LATITUDE_NUMBER_ERROR_MESSAGE,
  LONGITUDE_MAX_ERROR_MESSAGE,
  LONGITUDE_MIN_ERROR_MESSAGE,
  LONGITUDE_NUMBER_ERROR_MESSAGE,
  MAX_DISTANCE_MAX_ERROR_MESSAGE,
  MAX_DISTANCE_MIN_ERROR_MESSAGE,
  MAX_DISTANCE_NUMBER_ERROR_MESSAGE,
} from '@/application/errors/validations.constants';

export abstract class FindRoomsByLocationDto {
  @IsNumber({}, { message: LATITUDE_NUMBER_ERROR_MESSAGE })
  @Min(-90, { message: LATITUDE_MIN_ERROR_MESSAGE })
  @Max(90, { message: LATITUDE_MAX_ERROR_MESSAGE })
  @Type(() => Number)
  lat: number;

  @IsNumber({}, { message: LONGITUDE_NUMBER_ERROR_MESSAGE })
  @Min(-180, { message: LONGITUDE_MIN_ERROR_MESSAGE })
  @Max(180, { message: LONGITUDE_MAX_ERROR_MESSAGE })
  @Type(() => Number)
  lng: number;

  @IsOptional()
  @IsNumber({}, { message: MAX_DISTANCE_NUMBER_ERROR_MESSAGE })
  @Min(100, { message: MAX_DISTANCE_MIN_ERROR_MESSAGE })
  @Max(50000, { message: MAX_DISTANCE_MAX_ERROR_MESSAGE })
  @Type(() => Number)
  max_distance?: number;
}
