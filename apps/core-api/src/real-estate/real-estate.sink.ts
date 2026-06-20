import { Injectable, Logger } from '@nestjs/common';
import { CrawlTargetEntity } from '../crawler/targets/crawl-target.entity';
import { RawCrawlItem } from '../crawler/providers/crawler-provider.interface';
import {
  CrawlResultSink,
  CrawlSinkContext,
  CrawlSinkResult,
} from '../crawler/sink/crawl-sink.interface';
import { AdvertisementImageService } from './advertisement-image.service';
import { AdvertisementService } from './advertisement.service';
import {
  NormalizationService,
  NormalizedAdvertisement,
} from './normalization.service';
import { RawAdvertisement } from './real-estate.raw';

/**
 * Real-estate {@link CrawlResultSink}: turns the raw items a provider produced
 * into normalized advertisements and upserts them. Registered for every
 * real-estate site key (mock, divar) via the registration service.
 *
 * Runs inside the job processor's MikroORM request context, so the injected
 * services use the job-scoped EM.
 */
@Injectable()
export class RealEstateSink implements CrawlResultSink {
  private readonly logger = new Logger(RealEstateSink.name);

  constructor(
    private readonly normalization: NormalizationService,
    private readonly advertisements: AdvertisementService,
    private readonly images: AdvertisementImageService,
  ) {}

  async consume(
    items: RawCrawlItem[],
    ctx: CrawlSinkContext,
  ): Promise<CrawlSinkResult> {
    const result: CrawlSinkResult = { created: 0, updated: 0, skipped: 0 };

    for (const item of items) {
      try {
        const normalized = this.normalization.extract(item as RawAdvertisement);
        await this.applyImages(ctx.target, normalized);
        const { created } = await this.advertisements.upsert(
          ctx.target,
          ctx.job,
          normalized,
        );
        if (created) result.created++;
        else result.updated++;
      } catch (err: any) {
        result.skipped++;
        this.logger.warn(
          `Failed to persist ad ${item.externalId}: ${err?.message ?? err}`,
        );
      }
    }

    return result;
  }

  /**
   * Replace source image URLs with stored ones. Keeps the source URLs in
   * `attributes.sourceImages`, and reuses already-stored images on re-crawl so
   * we don't re-download every run.
   */
  private async applyImages(
    target: CrawlTargetEntity,
    normalized: NormalizedAdvertisement,
  ): Promise<void> {
    const source = normalized.images ?? [];
    if (source.length === 0) return;

    normalized.attributes = {
      ...(normalized.attributes ?? {}),
      sourceImages: source,
    };

    const existing = await this.advertisements.findOne({
      target: target.id,
      externalId: normalized.externalId,
    });
    if (existing?.images?.length) {
      normalized.images = existing.images;
      return;
    }

    normalized.images = await this.images.materialize(
      target.siteKey,
      normalized.externalId,
      source,
    );
  }
}
