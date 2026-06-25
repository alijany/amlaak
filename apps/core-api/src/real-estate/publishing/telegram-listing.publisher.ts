import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { RealEstateAdvertisementEntity } from '../advertisement.entity';
import { RealEstateCategory } from '../real-estate.constants';

const CATEGORY_LABEL: Record<RealEstateCategory, string> = {
  [RealEstateCategory.SALE]: 'فروش',
  [RealEstateCategory.RENT]: 'رهن و اجاره',
  [RealEstateCategory.MORTGAGE]: 'رهن کامل',
  [RealEstateCategory.UNKNOWN]: 'نامشخص',
};

export interface TelegramPostResult {
  messageId: number;
}

/**
 * Posts an approved listing to the configured Telegram channel. Reuses the Bot
 * API approach from the notification Telegram channel but supports photos.
 *
 * Config-driven and best-effort: when TELEGRAM_BOT_TOKEN / TELEGRAM_CHANNEL_ID
 * are unset it no-ops (logs a warning) so approval still works without Telegram.
 */
@Injectable()
export class TelegramListingPublisher {
  private readonly logger = new Logger(TelegramListingPublisher.name);

  constructor(private readonly config: ConfigService) {}

  async publish(
    ad: RealEstateAdvertisementEntity,
  ): Promise<TelegramPostResult | null> {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    const channelId = this.config.get<string>('TELEGRAM_CHANNEL_ID');

    if (!token || !channelId) {
      this.logger.warn(
        'Telegram not configured (TELEGRAM_BOT_TOKEN/TELEGRAM_CHANNEL_ID); skipping post.',
      );
      return null;
    }

    const caption = this.buildCaption(ad);
    const photo = ad.images?.[0];

    const base = `https://api.telegram.org/bot${token}`;
    const payload: Record<string, unknown> = {
      chat_id: channelId,
      parse_mode: 'Markdown',
    };

    const url = photo ? `${base}/sendPhoto` : `${base}/sendMessage`;
    if (photo) {
      payload.photo = photo;
      payload.caption = caption;
    } else {
      payload.text = caption;
    }

    const { data } = await axios.post(url, payload);
    return { messageId: data?.result?.message_id };
  }

  private buildCaption(ad: RealEstateAdvertisementEntity): string {
    const fa = (n?: number) =>
      n == null ? undefined : n.toLocaleString('fa-IR');
    const lines: string[] = [];

    lines.push(`*${ad.title ?? 'آگهی ملک'}*`);

    const loc = [ad.province, ad.city?.nameFa, ad.district]
      .filter(Boolean)
      .join(' · ');
    if (loc) lines.push(`📍 ${loc}`);

    lines.push(`🏷️ ${CATEGORY_LABEL[ad.category]}`);

    if (ad.totalPrice != null)
      lines.push(`💰 قیمت: ${fa(ad.totalPrice)} تومان`);
    if (ad.deposit != null) lines.push(`💵 ودیعه: ${fa(ad.deposit)} تومان`);
    if (ad.rent != null) lines.push(`🗓️ اجاره: ${fa(ad.rent)} تومان`);

    const specs = [
      ad.area != null ? `${fa(ad.area)} متر` : undefined,
      ad.rooms != null ? `${fa(ad.rooms)} خواب` : undefined,
      ad.yearBuilt != null ? `ساخت ${fa(ad.yearBuilt)}` : undefined,
    ].filter(Boolean);
    if (specs.length) lines.push(`📐 ${specs.join(' · ')}`);

    const webUrl = this.config.get<string>('PUBLIC_WEB_URL');
    if (webUrl) lines.push(`🔗 ${webUrl}/listings/${ad.id}`);

    lines.push(`کد رهگیری: NV-${ad.id.toString(36).toUpperCase()}`);

    return lines.join('\n');
  }
}
