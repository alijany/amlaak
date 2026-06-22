import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { RealEstateCategory } from '../real-estate.constants';

/** Filters for the public, unauthenticated listings catalog (published only). */
export class PublicListingFilterDto {
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

  @IsEnum(RealEstateCategory)
  @IsOptional()
  category?: RealEstateCategory;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  rooms?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  minPrice?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  maxPrice?: number;

  @IsString()
  @IsOptional()
  q?: string;
}
