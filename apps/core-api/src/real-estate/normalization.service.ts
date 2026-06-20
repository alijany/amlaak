import { Injectable } from '@nestjs/common';
import { normalizeNumbers } from 'src/libs/utils/pipe.normalizeNumbers';
import { RealEstateCategory } from './real-estate.constants';
import { RawAdvertisement } from './real-estate.raw';
import { ExtractionPipeline } from './extraction-pipeline.interface';

/** The normalized fields written to {@link RealEstateAdvertisementEntity}. */
export interface NormalizedAdvertisement {
  externalId: string;
  sourceUrl?: string;
  title?: string;
  description?: string;
  category: RealEstateCategory;
  totalPrice?: number;
  deposit?: number;
  rent?: number;
  pricePerMeter?: number;
  area?: number;
  rooms?: number;
  yearBuilt?: number;
  floor?: number;
  province?: string;
  city?: string;
  district?: string;
  lat?: number;
  lng?: number;
  images?: string[];
  attributes?: Record<string, any>;
  rawPayload?: Record<string, any>;
  postedAt?: Date;
  crawledAt: Date;
}

/**
 * Real-estate normalization stage. Maps loosely-typed provider attributes
 * (Persian digits, "۱۲۰ متر", price strings, ...) into typed columns, keeping
 * the original values in `attributes`/`rawPayload`.
 *
 * This is the natural seam for future AI enrichment: a later stage could take
 * the same RawAdvertisement (or a page snapshot) and fill gaps via an LLM.
 */
@Injectable()
export class NormalizationService
  implements ExtractionPipeline<NormalizedAdvertisement>
{
  extract(raw: RawAdvertisement): NormalizedAdvertisement {
    const fields = raw.data ?? {};
    const attrs = fields.attributes ?? {};

    return {
      externalId: raw.externalId,
      sourceUrl: raw.sourceUrl,
      title: fields.title,
      description: fields.description,
      category: fields.category ?? RealEstateCategory.UNKNOWN,
      totalPrice: this.parseNumber(attrs.totalPrice),
      deposit: this.parseNumber(attrs.deposit),
      rent: this.parseNumber(attrs.rent),
      pricePerMeter: this.parseNumber(attrs.pricePerMeter),
      area: this.parseNumber(attrs.area),
      rooms: this.parseNumber(attrs.rooms),
      yearBuilt: this.parseNumber(attrs.yearBuilt),
      floor: this.parseNumber(attrs.floor),
      province: this.toStr(attrs.province),
      city: this.toStr(attrs.city),
      district: this.toStr(attrs.district),
      lat: this.parseFloatSafe(attrs.lat),
      lng: this.parseFloatSafe(attrs.lng),
      images: fields.images,
      attributes: attrs,
      rawPayload: raw.raw as Record<string, any>,
      postedAt: fields.postedAt ? new Date(fields.postedAt) : undefined,
      crawledAt: new Date(),
    };
  }

  /** Extract the first integer from a possibly-Persian, unit-suffixed string. */
  private parseNumber(value: unknown): number | undefined {
    if (value == null) return undefined;
    if (typeof value === 'number')
      return Number.isFinite(value) ? value : undefined;
    const digits = normalizeNumbers(String(value)).replace(/[^\d]/g, '');
    if (!digits) return undefined;
    const n = Number(digits);
    return Number.isFinite(n) ? n : undefined;
  }

  private parseFloatSafe(value: unknown): number | undefined {
    if (value == null) return undefined;
    const n = Number(normalizeNumbers(String(value)));
    return Number.isFinite(n) ? n : undefined;
  }

  private toStr(value: unknown): string | undefined {
    if (value == null) return undefined;
    const s = String(value).trim();
    return s.length ? s : undefined;
  }
}
