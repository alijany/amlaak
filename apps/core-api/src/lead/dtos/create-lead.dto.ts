import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { LeadSource } from '../lead.constants';

export class CreateLeadDto {
  /** The listing (advertisement id) this inquiry is about. */
  @Type(() => Number)
  @IsInt()
  advertisementId: number;

  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  note?: string;

  /** Tracking code the caller referenced (optional; derived from the ad if omitted). */
  @IsString()
  @IsOptional()
  trackingCode?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  poolId?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  assignedAgentId?: number;
}
