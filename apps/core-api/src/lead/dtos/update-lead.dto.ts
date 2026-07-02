import { IsEnum, IsOptional } from 'class-validator';
import { LeadStatus } from '../lead.entity';

export class UpdateLeadDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;
}
