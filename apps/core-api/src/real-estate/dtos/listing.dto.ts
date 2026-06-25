import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { RealEstateCategory } from '../real-estate.constants';

export class CreateListingDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(RealEstateCategory)
  @IsOptional()
  category?: RealEstateCategory;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  totalPrice?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  deposit?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  rent?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  pricePerMeter?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  area?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  rooms?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  yearBuilt?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  floor?: number;

  @IsString()
  @IsOptional()
  province?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  cityId?: number;

  @IsString()
  @IsOptional()
  district?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  /** Free-form extra attributes (e.g. `{ propertySubtype }`). */
  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;
}

export class UpdateListingDto extends CreateListingDto {
  @IsString()
  @IsOptional()
  declare title: string;
}
