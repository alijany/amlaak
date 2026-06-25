import { ConfigService } from '@nestjs/config';
import { AgencyEntity } from '../agency/agency.entity';
import { RealEstateCategory } from '../real-estate/real-estate.constants';
import { LeadSource } from './lead.constants';
import { LeadEntity } from './lead.entity';

const CATEGORY_LABEL: Record<RealEstateCategory, string> = {
  [RealEstateCategory.SALE]: 'فروش',
  [RealEstateCategory.RENT]: 'رهن و اجاره',
  [RealEstateCategory.MORTGAGE]: 'رهن کامل',
  [RealEstateCategory.UNKNOWN]: 'نامشخص',
};

const SOURCE_LABEL: Record<LeadSource, string> = {
  [LeadSource.PHONE_CALL]: 'تماس تلفنی',
  [LeadSource.TELEGRAM]: 'تلگرام',
  [LeadSource.INSTAGRAM]: 'اینستاگرام',
  [LeadSource.WEBSITE]: 'وب‌سایت',
  [LeadSource.REFERRAL]: 'معرفی',
  [LeadSource.OTHER]: 'سایر',
};

/**
 * Plain-text Farsi message announcing a lead assigned to an agency. Kept
 * channel-agnostic (no Markdown) so it reads cleanly via both Telegram and SMS.
 * The lead's `advertisement` is expected to be populated by the caller.
 */
export function buildLeadMessage(
  lead: LeadEntity,
  agency: AgencyEntity,
  config: ConfigService,
): string {
  const fa = (n?: number) =>
    n == null ? undefined : n.toLocaleString('fa-IR');
  const ad = lead.advertisement;
  const lines: string[] = [];

  lines.push('🔔 لید جدید');
  lines.push(`آژانس: ${agency.name}`);

  if (ad?.title) lines.push(`🏠 ${ad.title}`);

  const loc = [ad?.province, ad?.city?.nameFa, ad?.district]
    .filter(Boolean)
    .join(' · ');
  if (loc) lines.push(`📍 ${loc}`);

  if (ad?.category) lines.push(`🏷️ ${CATEGORY_LABEL[ad.category]}`);

  if (ad?.totalPrice != null) lines.push(`💰 قیمت: ${fa(ad.totalPrice)} تومان`);
  if (ad?.deposit != null) lines.push(`💵 ودیعه: ${fa(ad.deposit)} تومان`);
  if (ad?.rent != null) lines.push(`🗓️ اجاره: ${fa(ad.rent)} تومان`);

  if (lead.contactName) lines.push(`👤 ${lead.contactName}`);
  if (lead.contactPhone) lines.push(`📞 ${lead.contactPhone}`);
  lines.push(`📨 منبع: ${SOURCE_LABEL[lead.source]}`);
  if (lead.note) lines.push(`📝 ${lead.note}`);

  if (lead.trackingCode) lines.push(`کد رهگیری: ${lead.trackingCode}`);

  const webUrl = config.get<string>('PUBLIC_WEB_URL');
  if (webUrl && ad?.id) lines.push(`🔗 ${webUrl}/dashboard/leads/${lead.id}`);

  return lines.join('\n');
}

/**
 * Short Farsi SMS sent to a lead's contact with the listing summary and a
 * public link to view it. The lead's `advertisement` (and `advertisement.city`)
 * is expected to be populated by the caller.
 */
export function buildAdDetailSms(
  lead: LeadEntity,
  config: ConfigService,
): string {
  const fa = (n?: number) =>
    n == null ? undefined : n.toLocaleString('fa-IR');
  const ad = lead.advertisement;
  const lines: string[] = [];

  lines.push(`آگهی: ${ad?.title ?? 'ملک'}`);

  const loc = [ad?.province, ad?.city?.nameFa, ad?.district]
    .filter(Boolean)
    .join(' · ');
  if (loc) lines.push(`📍 ${loc}`);

  if (ad?.totalPrice != null) lines.push(`💰 ${fa(ad.totalPrice)} تومان`);
  else if (ad?.deposit != null || ad?.rent != null) {
    if (ad?.deposit != null) lines.push(`💵 ودیعه: ${fa(ad.deposit)} تومان`);
    if (ad?.rent != null) lines.push(`🗓️ اجاره: ${fa(ad.rent)} تومان`);
  }

  const webUrl = config.get<string>('PUBLIC_WEB_URL');
  if (webUrl && ad?.id) lines.push(`مشاهده: ${webUrl}/listings/${ad.id}`);

  return lines.join('\n');
}
