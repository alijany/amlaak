import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class AssignLeadDto {
  @Type(() => Number)
  @IsInt()
  agentId: number;
}
