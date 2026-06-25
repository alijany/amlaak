import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { LeadDelivery } from '../agency.constants';

export type AgencyStatusFilter = 'pending' | 'active' | 'inactive' | 'all';

export class AgencyFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  page?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsIn(['pending', 'active', 'inactive', 'all'])
  status?: AgencyStatusFilter;

  @IsOptional()
  @IsString()
  search?: string;
}

export class InviteAgencyDto {
  @IsString()
  agencyName: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  agencyPhone?: string;
}

export class CreateAgencyDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  banner?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cityId?: number;

  @IsString()
  @IsOptional()
  address?: string;
}

export class UpdateAgencyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  banner?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cityId?: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  /**
   * Admin-only. The agency's Telegram group chat id (e.g. -1001234567890).
   * `null` clears it. Non-admin callers have this stripped in the controller.
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  telegramGroupId?: number | null;

  /** Admin-only. How newly assigned leads are delivered to this agency. */
  @IsOptional()
  @IsIn(Object.values(LeadDelivery))
  leadDelivery?: LeadDelivery;
}
