import { IsOptional, IsString } from 'class-validator';
import { NAME_ERROR_MESSAGE } from '@/application/errors/validations.constants';

export abstract class UpdateUserDto {
  @IsOptional()
  @IsString({ message: NAME_ERROR_MESSAGE })
  name: string;
}
