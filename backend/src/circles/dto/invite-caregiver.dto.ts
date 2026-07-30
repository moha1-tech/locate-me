import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { Permission } from '@prisma/client';

export class InviteCaregiverDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsEnum(Permission)
  permission?: Permission;
}
