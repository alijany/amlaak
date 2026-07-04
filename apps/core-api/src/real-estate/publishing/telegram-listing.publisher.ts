import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { RealEstateAdvertisementEntity } from '../advertisement.entity';
import { RealEstateCategory } from '../real-estate.constants';
import { telegramRequestConfig } from '../../libs/utils/telegram-http';
import { advertisementTrackingCode } from '../../lead/lead.tracking';

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

    const { text: caption } = this.buildCaption(ad);

    // Telegram's sendPhoto-by-URL fetches the image from Telegram's own
    // servers, so the URL must be publicly reachable. In local/dev the image
    // lives on an internal host (e.g. MinIO at http://minio:9000) that Telegram
    // can't reach — sending it yields "wrong HTTP URL specified". Fall back to
    // text-only there; in prod (public CDN/S3 URL) the photo is included.
    const publicPhotos = (ad.images ?? [])
      .filter((url) => this.isPubliclyFetchable(url))
      .slice(0, 4);

    if ((ad.images?.length ?? 0) > 0 && publicPhotos.length === 0) {
      this.logger.debug(
        `No publicly fetchable image URLs found; posting text only.`,
      );
    }

    const base = `https://api.telegram.org/bot${token}`;
    const reqConfig = telegramRequestConfig(this.config);

    if (publicPhotos.length === 0) {
      const { data } = await axios.post(
        `${base}/sendMessage`,
        {
          chat_id: channelId,
          text: caption,
          parse_mode: 'HTML',
        },
        reqConfig,
      );
      return { messageId: data?.result?.message_id };
    }

    if (publicPhotos.length === 1) {
      const { data } = await axios.post(
        `${base}/sendPhoto`,
        {
          chat_id: channelId,
          photo: publicPhotos[0],
          caption,
          parse_mode: 'HTML',
        },
        reqConfig,
      );
      return { messageId: data?.result?.message_id };
    }

    // 2–4 photos: send as a media group (album); caption goes on the first item.
    const media = publicPhotos.map((url, i) => ({
      type: 'photo',
      media: url,
      ...(i === 0 ? { caption, parse_mode: 'HTML' } : {}),
    }));

    const { data } = await axios.post(
      `${base}/sendMediaGroup`,
      { chat_id: channelId, media },
      reqConfig,
    );
    const firstMessageId: number = data?.result?.[0]?.message_id;

    return { messageId: firstMessageId };
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

  private buildCaption(ad: RealEstateAdvertisementEntity): { text: string } {
    const fa = (n?: number) =>
      n == null ? undefined : n.toLocaleString('fa-IR');
    const lines: string[] = [];

    const trackingCode = advertisementTrackingCode(ad.id);
    lines.push(`#${trackingCode}`);

    lines.push(`<b>${this.escapeHtml(ad.title ?? 'آگهی ملک')}</b>`);

    const loc = [ad.province, ad.city?.nameFa, ad.district]
      .filter(Boolean)
      .join(' · ');
    if (loc) lines.push(`📍 ${this.escapeHtml(loc)}`);

    lines.push(`🏷️ ${CATEGORY_LABEL[ad.category]}`);

    if (ad.totalPrice != null)
      lines.push(`💰 قیمت: ${fa(ad.totalPrice)} تومان`);
    if (ad.deposit != null) lines.push(`💵 ودیعه: ${fa(ad.deposit)} تومان`);
    if (ad.rent != null) lines.push(`🗓️ اجاره: ${fa(ad.rent)} تومان`);

    if (ad.area != null) lines.push(`📐 ${fa(ad.area)} متر`);

    const contactPhone = ad.agency?.isPlatform
      ? this.config.get<string>('CONTACT_PHONE')
      : ad.agency?.phone;
    if (contactPhone) {
      lines.push('');
      lines.push('📞تماس با ادمین:');
      lines.push(this.escapeHtml(contactPhone));
    }

    lines.push('', '👩🏻‍💻ارتباط با ادمین:', '@rinko_admin');

    const domain = this.config.get<string>('DOMAIN');
    if (domain) {
      const href = this.escapeHtmlAttr(
        `${this.withScheme(domain)}/listings/${ad.id}`,
      );
      lines.push('', `🔗 <a href="${href}">مشاهده آگهی در وب‌سایت</a>`);
    }

    lines.push('', '❗️برای استعلام ملک لطفا به کد درج شده در متن توجه کنید.');

    return { text: lines.join('\n') };
  }

  /**
   * Telegram's HTML parse mode only treats & < > (and quotes in attributes)
   * specially, unlike legacy Markdown which trips on _ * ` [ in ordinary text
   * (e.g. an admin handle or title containing "_" would otherwise get eaten
   * as an unmatched italic marker). Escape the minimal HTML set instead.
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private escapeHtmlAttr(text: string): string {
    return this.escapeHtml(text).replace(/"/g, '&quot;');
  }

  /**
   * DOMAIN is configured without a scheme (e.g. "novamelk.ir"). Telegram only
   * renders `<a href>` as a clickable link when the URL has an explicit
   * http(s) scheme — otherwise it's shown as literal, unlinked text.
   */
  private withScheme(domain: string): string {
    return /^https?:\/\//i.test(domain) ? domain : `https://${domain}`;
  }
}
