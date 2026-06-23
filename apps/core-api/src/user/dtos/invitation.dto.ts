import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
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

  /** When set, the assigned role is scoped to this agency. */
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  agencyId?: number;
}
