import { LeadSource, LeadStatus } from './leads.types';

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'جدید',
  [LeadStatus.CONTACTED]: 'پیگیری‌شده',
  [LeadStatus.QUALIFIED]: 'واجد شرایط',
  [LeadStatus.WON]: 'موفق',
  [LeadStatus.LOST]: 'ناموفق',
};

export const LEAD_SOURCE_LABEL: Record<LeadSource, string> = {
  [LeadSource.PHONE_CALL]: 'تماس تلفنی',
  [LeadSource.TELEGRAM]: 'تلگرام',
  [LeadSource.INSTAGRAM]: 'اینستاگرام',
  [LeadSource.WEBSITE]: 'وب‌سایت',
  [LeadSource.REFERRAL]: 'معرفی',
  [LeadSource.OTHER]: 'سایر',
};

/** Ordered pipeline for status selectors / funnels. */
export const LEAD_STATUS_ORDER: LeadStatus[] = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.QUALIFIED,
  LeadStatus.WON,
  LeadStatus.LOST,
];
