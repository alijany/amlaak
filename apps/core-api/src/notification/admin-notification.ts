import { ConfigService } from '@nestjs/config';

/**
 * Plain-text Farsi messages announcing operational events to the platform
 * operators (admins). Kept channel-agnostic (no Markdown) so they read cleanly
 * over Telegram. Delivered via {@link NotificationService.notifyAdmins}.
 */

function dashboardLink(config: ConfigService, path: string): string | null {
  const webUrl = config.get<string>('DOMAIN');
  return webUrl ? `🔗 ${webUrl}${path}` : null;
}

/** A self-registered agency awaiting admin confirmation. */
export function buildNewAgencyMessage(
  agency: { id: number; name: string; phone?: string },
  owner: { firstName?: string; lastName?: string; phone?: string } | undefined,
  config: ConfigService,
): string {
  const lines: string[] = [];
  lines.push('🏢 آژانس جدید در انتظار تأیید');
  lines.push(`نام: ${agency.name}`);
  const ownerName = [owner?.firstName, owner?.lastName]
    .filter(Boolean)
    .join(' ');
  if (ownerName) lines.push(`👤 مالک: ${ownerName}`);
  const phone = agency.phone ?? owner?.phone;
  if (phone) lines.push(`📞 ${phone}`);
  const link = dashboardLink(config, '/dashboard/agencies');
  if (link) lines.push(link);
  return lines.join('\n');
}

/** A finished crawl that produced new ads needing review. */
export function buildCrawlEndedMessage(
  target: { name: string },
  stats: { created: number; updated: number },
  config: ConfigService,
): string {
  const fa = (n: number) => n.toLocaleString('fa-IR');
  const lines: string[] = [];
  lines.push('🕷️ کرال جدید به پایان رسید');
  lines.push(`منبع: ${target.name}`);
  lines.push(`✅ ${fa(stats.created)} آگهی جدید در انتظار تأیید`);
  if (stats.updated > 0)
    lines.push(`♻️ ${fa(stats.updated)} آگهی بروزرسانی شد`);
  const link = dashboardLink(config, '/dashboard/listings');
  if (link) lines.push(link);
  return lines.join('\n');
}

/** A new agency-created listing awaiting admin approval. */
export function buildNewAdMessage(
  ad: {
    id: number;
    title?: string;
    city?: { nameFa?: string };
    district?: string;
    totalPrice?: number;
  },
  agency: { name: string } | undefined,
  config: ConfigService,
): string {
  const fa = (n?: number) =>
    n == null ? undefined : n.toLocaleString('fa-IR');
  const lines: string[] = [];
  lines.push('📋 آگهی جدید در انتظار تأیید');
  if (agency?.name) lines.push(`آژانس: ${agency.name}`);
  lines.push(`🏠 ${ad.title ?? 'آگهی ملک'}`);
  const loc = [ad.city?.nameFa, ad.district].filter(Boolean).join(' · ');
  if (loc) lines.push(`📍 ${loc}`);
  if (ad.totalPrice != null) lines.push(`💰 ${fa(ad.totalPrice)} تومان`);
  const link = dashboardLink(config, '/dashboard/listings');
  if (link) lines.push(link);
  return lines.join('\n');
}
