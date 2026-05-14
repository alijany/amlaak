import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { InvitationStatus } from 'src/roles/roles.entity';

export class AddUserDto {
  @IsEmail()
  phone: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}

export class UserFilterDto {
  @IsEnum(InvitationStatus)
  @IsOptional()
  invitationStatus?: InvitationStatus;

  @IsNumber()
  roleId: number;
}
