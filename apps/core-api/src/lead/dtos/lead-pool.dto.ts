import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLeadPoolDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  agencyIds: number[];
}

export class UpdateLeadPoolDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  /** Replace the full list of member agencies. */
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  agencyIds?: number[];
}
