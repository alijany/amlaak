import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/roles/roles.constants';

export class InviteUserDto {
  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
