import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CrawlTargetEntity } from '../crawler/targets/crawl-target.entity';
import { RawCrawlItem } from '../crawler/providers/crawler-provider.interface';
import {
  CrawlResultSink,
  CrawlSinkContext,
  CrawlSinkResult,
} from '../crawler/sink/crawl-sink.interface';
import { buildCrawlEndedMessage } from '../notification/admin-notification';
import { NotificationService } from '../notification/services/notification.service';
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
    private readonly notifications: NotificationService,
    private readonly config: ConfigService,
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

    // Alert operators when a crawl produced new ads that need confirmation.
    if (result.created > 0) {
      await this.notifyAdminsOfCrawl(ctx.target, result);
    }

    return result;
  }

  /** Best-effort: tell operators a crawl finished with new ads to review. */
  private async notifyAdminsOfCrawl(
    target: CrawlTargetEntity,
    result: CrawlSinkResult,
  ): Promise<void> {
    try {
      const message = buildCrawlEndedMessage(target, result, this.config);
      await this.notifications.notifyAdmins(message, {
        priority: 'normal',
        metadata: { targetId: target.id, kind: 'crawl_ended', ...result },
      });
    } catch (err: any) {
      this.logger.warn(
        `Failed to notify admins of crawl ${target.id}: ${err?.message ?? err}`,
      );
    }
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
