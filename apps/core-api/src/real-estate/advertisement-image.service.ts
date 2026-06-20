import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3StorageService } from '../storage/s3-storage.service';

/**
 * Downloads advertisement images from their source CDN and stores them in S3,
 * returning the stored public URLs. Bounded and best-effort: a failed image
 * falls back to its source URL so the record still references something.
 *
 * Disabled via CRAWLER_STORE_IMAGES=false (then source URLs are kept as-is).
 */
@Injectable()
export class AdvertisementImageService {
  private readonly logger = new Logger(AdvertisementImageService.name);
  private readonly enabled: boolean;
  private readonly maxPerAd: number;
  private readonly timeoutMs: number;
  private readonly maxBytes: number;
  private readonly retries: number;

  constructor(
    private readonly storage: S3StorageService,
    config: ConfigService,
  ) {
    this.enabled = config.get('CRAWLER_STORE_IMAGES', 'true') !== 'false';
    this.maxPerAd = Number(config.get('CRAWLER_IMAGE_MAX_PER_AD', 8));
    this.timeoutMs = Number(config.get('CRAWLER_IMAGE_TIMEOUT_MS', 15_000));
    this.maxBytes = Number(config.get('CRAWLER_IMAGE_MAX_BYTES', 8_000_000));
    this.retries = Number(config.get('CRAWLER_IMAGE_RETRIES', 2));
  }

  /**
   * Store the given source image URLs for `(siteKey, externalId)` and return the
   * resulting URLs. Storage keys are deterministic, so re-running overwrites in
   * place rather than duplicating.
   */
  async materialize(
    siteKey: string,
    externalId: string,
    sourceUrls: string[],
  ): Promise<string[]> {
    const urls = [...new Set(sourceUrls)].slice(0, this.maxPerAd);
    if (!this.enabled || urls.length === 0) return urls;

    const folder = `crawler/${siteKey}/${this.safe(externalId)}`;
    const stored: string[] = [];

    for (let i = 0; i < urls.length; i++) {
      try {
        stored.push(await this.storeOne(urls[i], folder, i));
      } catch (err) {
        // Keep the source URL so the ad still has an image reference.
        stored.push(urls[i]);
        this.logger.warn(
          `Image store failed (${externalId}#${i}): ${
            (err as Error)?.message ?? err
          }`,
        );
      }
    }
    return stored;
  }

  private async storeOne(
    url: string,
    folder: string,
    index: number,
  ): Promise<string> {
    const res = await this.fetchWithRetry(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      throw new Error(`Unexpected content-type: ${contentType}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength > this.maxBytes) {
      throw new Error(`Image too large: ${buffer.byteLength} bytes`);
    }

    const filename = `${index}.${this.extFor(contentType)}`;
    return this.storage.uploadBuffer(buffer, filename, contentType, folder);
  }

  /** Fetch with a timeout and a few retries on transient network failures. */
  private async fetchWithRetry(url: string): Promise<Response> {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        return await fetch(url, {
          signal: AbortSignal.timeout(this.timeoutMs),
          headers: {
            'user-agent':
              'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/121.0',
            referer: 'https://divar.ir/',
          },
        });
      } catch (err) {
        lastErr = err;
        if (attempt < this.retries) {
          await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
        }
      }
    }
    throw lastErr;
  }

  private extFor(contentType: string): string {
    const sub = contentType.split('/')[1]?.split(';')[0] ?? 'jpg';
    return sub === 'jpeg' ? 'jpg' : sub;
  }

  /** Make an external id safe for use as a storage path segment. */
  private safe(externalId: string): string {
    return externalId.replace(/[^a-zA-Z0-9_-]/g, '_');
  }
}
