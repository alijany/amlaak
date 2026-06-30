import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RealEstateAdvertisementEntity } from './advertisement.entity';
import { AdvertisementService } from './advertisement.service';
import { TelegramListingPublisher } from './publishing/telegram-listing.publisher';
import { PublishStatus } from './real-estate.constants';

/**
 * Approve-first moderation: a manager approves a pending listing, which marks it
 * PUBLISHED (visible on the public site) and posts it to the Telegram channel.
 */
@Injectable()
export class ListingModerationService {
  private readonly logger = new Logger(ListingModerationService.name);

  constructor(
    private readonly advertisements: AdvertisementService,
    private readonly telegram: TelegramListingPublisher,
  ) {}

  async approve(id: number): Promise<RealEstateAdvertisementEntity> {
    const ad = await this.advertisements.findOne(
      { id },
      { populate: ['city', 'agency'] as never },
    );
    if (!ad) throw new NotFoundException('listing not found');

    const alreadyPublished = ad.publishStatus === PublishStatus.PUBLISHED;
    await this.advertisements.setPublishStatus(ad, PublishStatus.PUBLISHED);

    // Post to Telegram once, best-effort — never block approval on it.
    if (!alreadyPublished && !ad.telegramPostedAt) {
      try {
        const result = await this.telegram.publish(ad);
        if (result) {
          ad.telegramPostedAt = new Date();
          ad.telegramMessageId = result.messageId;
          await this.advertisements.persistAndFlush(ad);
        }
      } catch (err: any) {
        this.logger.warn(
          `Telegram post failed for listing ${id}: ${err?.message ?? err}`,
        );
      }
    }

    return ad;
  }

  async reject(id: number): Promise<RealEstateAdvertisementEntity> {
    const ad = await this.advertisements.findOne({ id });
    if (!ad) throw new NotFoundException('listing not found');
    await this.advertisements.setPublishStatus(ad, PublishStatus.REJECTED);
    return ad;
  }

  /** Re-post an already-published listing to Telegram (e.g. after editing). */
  async resendTelegram(id: number): Promise<RealEstateAdvertisementEntity> {
    const ad = await this.advertisements.findOne(
      { id },
      { populate: ['city', 'agency'] as never },
    );
    if (!ad) throw new NotFoundException('listing not found');

    const result = await this.telegram.publish(ad);
    if (result) {
      ad.telegramPostedAt = new Date();
      ad.telegramMessageId = result.messageId;
      await this.advertisements.persistAndFlush(ad);
    }
    return ad;
  }
}
