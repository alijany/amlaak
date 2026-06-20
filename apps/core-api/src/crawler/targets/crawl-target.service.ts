import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs/mikro-orm.common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseRepositoryService } from 'src/libs/orm/orm.repository.service.base';
import { CrawlTargetStatus, TargetAccessibility } from '../crawler.constants';
import { CrawlTargetEntity } from './crawl-target.entity';

@Injectable()
export class CrawlTargetService extends BaseRepositoryService<CrawlTargetEntity> {
  constructor(
    @InjectRepository(CrawlTargetEntity)
    protected repository: EntityRepository<CrawlTargetEntity>,
  ) {
    super(repository);
  }

  async getByIdOrThrow(id: number): Promise<CrawlTargetEntity> {
    const target = await this.findOne({ id });
    if (!target) {
      throw new NotFoundException(`Crawl target ${id} not found`);
    }
    return target;
  }

  async setStatus(
    id: number,
    status: CrawlTargetStatus,
    error?: string,
  ): Promise<CrawlTargetEntity> {
    const target = await this.getByIdOrThrow(id);
    target.status = status;
    target.lastError = error ?? undefined;
    if (status === CrawlTargetStatus.RUNNING) {
      // keep lastCrawledAt until completion
    }
    await this.persistAndFlush(target);
    return target;
  }

  async markCrawled(id: number): Promise<void> {
    const target = await this.getByIdOrThrow(id);
    target.lastCrawledAt = new Date();
    target.accessibility = TargetAccessibility.ONLINE;
    await this.persistAndFlush(target);
  }
}
