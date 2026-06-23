import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/roles/roles.constants';

/** Invite/assign a member into an agency with an agency-scoped role. */
export class InviteAgencyMemberDto {
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
