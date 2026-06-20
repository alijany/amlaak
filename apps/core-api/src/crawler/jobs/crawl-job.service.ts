import { InjectQueue } from '@nestjs/bull';
import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import {
  CRAWL_JOBS_QUEUE,
  CrawlJobStatus,
  CrawlJobType,
} from '../crawler.constants';
import { CrawlerProviderRegistry } from '../providers/crawler-provider.registry';
import { CrawlTargetService } from '../targets/crawl-target.service';
import { CrawlJobEntity } from './crawl-job.entity';
import { CrawlJobFilterDto, CreateCrawlJobDto } from './dtos/crawl-job.dto';

/** Payload pushed onto the Bull queue. Keep it minimal — load the rest by id. */
export interface CrawlJobPayload {
  jobId: number;
  maxItems?: number;
}

@Injectable()
export class CrawlJobService extends BaseRepositoryService<CrawlJobEntity> {
  constructor(
    @InjectRepository(CrawlJobEntity)
    protected repository: EntityRepository<CrawlJobEntity>,
    @InjectQueue(CRAWL_JOBS_QUEUE)
    private readonly queue: Queue<CrawlJobPayload>,
    private readonly targetService: CrawlTargetService,
    private readonly registry: CrawlerProviderRegistry,
  ) {
    super(repository);
  }

  /** Create a job record and enqueue it for processing. */
  async enqueue(
    targetId: number,
    dto: CreateCrawlJobDto,
  ): Promise<CrawlJobEntity> {
    const target = await this.targetService.getByIdOrThrow(targetId);
    const provider = this.registry.get(target.siteKey);
    const type = dto.type ?? CrawlJobType.FULL_SCAN;

    if (!provider.metadata.supportedJobTypes.includes(type)) {
      throw new BadRequestException(
        `Provider "${target.siteKey}" does not support job type "${type}"`,
      );
    }

    const job = await this.create({
      target,
      type,
      params: dto.params,
      status: CrawlJobStatus.PENDING,
    });

    await this.queue.add(
      { jobId: job.id, maxItems: dto.maxItems },
      { removeOnComplete: 100, removeOnFail: 100 },
    );

    job.status = CrawlJobStatus.QUEUED;
    await this.persistAndFlush(job);
    return job;
  }

  async cancel(jobId: number): Promise<CrawlJobEntity> {
    const job = await this.findOne({ id: jobId });
    if (!job) throw new BadRequestException(`Job ${jobId} not found`);
    if (
      job.status === CrawlJobStatus.COMPLETED ||
      job.status === CrawlJobStatus.FAILED
    ) {
      throw new BadRequestException('Job already finished');
    }
    job.status = CrawlJobStatus.CANCELED;
    job.finishedAt = new Date();
    await this.persistAndFlush(job);
    return job;
  }

  async search(filters: CrawlJobFilterDto) {
    const { page = 0, limit = 10, targetId, status } = filters;
    const where: FilterQuery<CrawlJobEntity> = {};
    if (targetId) where.target = targetId;
    if (status) where.status = status;

    const [items, total] = await this.findAll(where, {
      orderBy: { created_at: 'DESC' },
      limit,
      offset: page * limit,
      populate: ['target'] as never,
    });

    return {
      items,
      meta: { page, limit, total, pageCount: Math.ceil(total / limit) },
    };
  }
}
