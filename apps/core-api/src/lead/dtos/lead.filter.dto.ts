import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { LeadSource, LeadStatus } from '../lead.constants';

export class LeadFilterDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  poolId?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  assignedAgentId?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  advertisementId?: number;

  /** Free-text over contact name/phone, tracking code, and listing title. */
  @IsString()
  @IsOptional()
  q?: string;
}
