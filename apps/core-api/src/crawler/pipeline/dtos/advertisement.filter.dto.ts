import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { RealEstateCategory } from '../../crawler.constants';

export class AdvertisementFilterDto {
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

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  targetId?: number;

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

  /** Free-text search over title/description. */
  @IsString()
  @IsOptional()
  q?: string;
}
