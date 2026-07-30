import { IsString, MinLength } from 'class-validator';

export class UpdatePushTokenDto {
  @IsString()
  @MinLength(1)
  token!: string;
}
