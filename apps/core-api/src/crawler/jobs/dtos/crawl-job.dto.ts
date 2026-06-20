import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsObject, IsOptional, Min } from 'class-validator';
import { CrawlJobStatus, CrawlJobType } from '../../crawler.constants';

export class CreateCrawlJobDto {
  @IsEnum(CrawlJobType)
  @IsOptional()
  type?: CrawlJobType;

  @IsObject()
  @IsOptional()
  params?: Record<string, any>;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  maxItems?: number;
}

export class CrawlJobFilterDto {
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

  @IsEnum(CrawlJobStatus)
  @IsOptional()
  status?: CrawlJobStatus;
}
