import { IsEnum } from 'class-validator';
import { Role } from 'src/roles/roles.constants';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role: Role;
}
