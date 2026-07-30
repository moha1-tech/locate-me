import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export enum RegisterRole {
  PATIENT = 'PATIENT',
  CAREGIVER = 'CAREGIVER',
}

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsEnum(RegisterRole)
  role!: RegisterRole;
}
