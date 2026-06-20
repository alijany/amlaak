import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { CrawlJobType } from '../../crawler.constants';

/** Create/replace a target's schedule. */
export class UpsertCrawlScheduleDto {
  /** Standard cron expression */
  @IsString()
  cron: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsEnum(CrawlJobType)
  jobType?: CrawlJobType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  maxItems?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60_000)
  crawlDelayMs?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
