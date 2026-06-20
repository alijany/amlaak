import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { CrawlTargetStatus } from '../../crawler.constants';

export class CreateCrawlTargetDto {
  @IsString()
  siteKey: string;

  @IsString()
  name: string;

  @IsString()
  baseUrl: string;

  @IsString()
  @IsOptional()
  startPath?: string;

  @IsBoolean()
  @IsOptional()
  requiresAuth?: boolean;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}

export class UpdateCrawlTargetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  baseUrl?: string;

  @IsString()
  @IsOptional()
  startPath?: string;

  @IsBoolean()
  @IsOptional()
  requiresAuth?: boolean;

  @IsEnum(CrawlTargetStatus)
  @IsOptional()
  status?: CrawlTargetStatus;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
