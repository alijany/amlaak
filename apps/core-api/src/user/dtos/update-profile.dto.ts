import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserType } from '../user.entity';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;

  // Organization-specific fields (optional, required for legal users)
  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsString()
  organizationRegistrationNumber?: string;

  @IsOptional()
  @IsString()
  organizationNationalId?: string;

  @IsOptional()
  @IsString()
  organizationRepresentative?: string;
}

export class UpdatePhoneDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  otp: string;
}
