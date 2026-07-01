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

    const { text: caption, url: listingUrl } = this.buildCaption(ad);
    const inlineKeyboard = listingUrl
      ? {
          inline_keyboard: [
            [{ text: '🔗 مشاهده آگهی در وب‌سایت', url: listingUrl }],
          ],
        }
      : undefined;

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
          parse_mode: 'Markdown',
          ...(inlineKeyboard ? { reply_markup: inlineKeyboard } : {}),
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
          parse_mode: 'Markdown',
          ...(inlineKeyboard ? { reply_markup: inlineKeyboard } : {}),
        },
        reqConfig,
      );
      return { messageId: data?.result?.message_id };
    }

    // 2–4 photos: send as a media group (album); caption goes on the first item.
    // sendMediaGroup does not support reply_markup, so send a follow-up reply.
    const media = publicPhotos.map((url, i) => ({
      type: 'photo',
      media: url,
      ...(i === 0 ? { caption, parse_mode: 'Markdown' } : {}),
    }));

    const { data } = await axios.post(
      `${base}/sendMediaGroup`,
      { chat_id: channelId, media },
      reqConfig,
    );
    const firstMessageId: number = data?.result?.[0]?.message_id;

    if (inlineKeyboard && firstMessageId) {
      await axios
        .post(
          `${base}/sendMessage`,
          {
            chat_id: channelId,
            text: '🔗',
            reply_to_message_id: firstMessageId,
            reply_markup: inlineKeyboard,
          },
          reqConfig,
        )
        .catch((err) =>
          this.logger.warn(`Failed to send button reply: ${err?.message}`),
        );
    }

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

  private buildCaption(ad: RealEstateAdvertisementEntity): {
    text: string;
    url: string | undefined;
  } {
    const fa = (n?: number) =>
      n == null ? undefined : n.toLocaleString('fa-IR');
    const lines: string[] = [];

    lines.push(`*${this.escapeMarkdown(ad.title ?? 'آگهی ملک')}*`);

    const loc = [ad.province, ad.city?.nameFa, ad.district]
      .filter(Boolean)
      .join(' · ');
    if (loc) lines.push(`📍 ${this.escapeMarkdown(loc)}`);

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

    const contactPhone = ad.agency?.isPlatform
      ? this.config.get<string>('CONTACT_PHONE')
      : ad.agency?.phone;
    if (contactPhone) lines.push(`📞 ${this.escapeMarkdown(contactPhone)}`);

    // Numeric-only so it doubles cleanly as a hashtag (e.g. #12345).
    const trackingCode = `${ad.id}`;
    lines.push(`🔑 کد: ${trackingCode}`);

    // Hashtags: city + district + tracking code
    const tags: string[] = [];
    if (ad.city?.nameFa)
      tags.push(`#${this.sanitizeHashtag(ad.city.nameFa)}`);
    if (ad.district) tags.push(`#${this.sanitizeHashtag(ad.district)}`);
    tags.push(`#${trackingCode}`);
    lines.push(tags.join(' '));

    lines.push(
      '',
      '👩🏻‍💻ارتباط با ادمین:',
      '@rinko_admin',
      '',
      '❗️برای استعلام ملک لطفا به کد درج شده در متن توجه کنید.',
    );

    const domain = this.config.get<string>('DOMAIN');
    const url = domain ? `${domain}/listings/${ad.id}` : undefined;

    return { text: lines.join('\n'), url };
  }

  /**
   * Legacy Telegram Markdown treats `_ * ` [ ` as formatting control chars.
   * User-supplied text (title, location, phone) can contain them and would
   * otherwise leave an unmatched entity, which Telegram rejects with a 400
   * ("can't parse entities"). Escape them so free-text is rendered literally.
   */
  private escapeMarkdown(text: string): string {
    return text.replace(/([_*`[])/g, '\\$1');
  }

  /**
   * Telegram hashtags only recognize contiguous word characters, so anything
   * else (spaces, punctuation) breaks the tag or merges it with following
   * text. Strip to letters/digits/underscore and collapse whitespace to `_`.
   */
  private sanitizeHashtag(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^\p{L}\p{N}_]/gu, '');
  }
}
