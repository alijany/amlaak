import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { RealEstateAdvertisementEntity } from '../advertisement.entity';
import { RealEstateCategory } from '../real-estate.constants';
import { telegramRequestConfig } from '../../libs/utils/telegram-http';

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
    // Telegram's sendPhoto-by-URL fetches the image from Telegram's own
    // servers, so the URL must be publicly reachable. In local/dev the image
    // lives on an internal host (e.g. MinIO at http://minio:9000) that Telegram
    // can't reach — sending it yields "wrong HTTP URL specified". Fall back to
    // text-only there; in prod (public CDN/S3 URL) the photo is included.
    const photo = ad.images?.[0];
    const usePhoto = !!photo && this.isPubliclyFetchable(photo);
    if (photo && !usePhoto) {
      this.logger.debug(
        `Image URL not publicly fetchable (${photo}); posting text only.`,
      );
    }

    const base = `https://api.telegram.org/bot${token}`;
    const payload: Record<string, unknown> = {
      chat_id: channelId,
      parse_mode: 'Markdown',
    };

    const url = usePhoto ? `${base}/sendPhoto` : `${base}/sendMessage`;
    if (usePhoto) {
      payload.photo = photo;
      payload.caption = caption;
    } else {
      payload.text = caption;
    }

    const { data } = await axios.post(
      url,
      payload,
      telegramRequestConfig(this.config),
    );
    return { messageId: data?.result?.message_id };
  }

  /**
   * Whether Telegram's servers could fetch this image URL: an absolute http(s)
   * URL on a non-local, non-internal host. Internal hosts (localhost, MinIO,
   * Docker service names) are only reachable from inside our network, so
   * sendPhoto-by-URL would fail — callers fall back to a text-only post.
   */
  private isPubliclyFetchable(rawUrl: string): boolean {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return false; // not an absolute URL (bare key, relative path, etc.)
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    const isLocal =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host === '0.0.0.0' ||
      !host.includes('.') || // single-label Docker service names (e.g. "minio")
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host);

    return !isLocal;
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
