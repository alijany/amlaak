import { AppLocale, resolveLocale } from './i18n.constants';

/**
 * Every sentence this backend renders itself.
 *
 * SMS is the one path where the language cannot be decided by the reader's
 * browser: there is no page, no URL prefix and no catalog — only a phone
 * number. So the copy lives here rather than in the PWA catalogs, and it is
 * the *only* backend-rendered copy. HTTP errors travel as codes the PWA
 * translates (`libs/error/`).
 *
 * This is a map, not a framework. Two languages, a handful of strings, no
 * runtime dependency. Add a template here, with both languages, before a
 * caller sends a new kind of SMS.
 */
export enum SmsTemplate {
  OTP = 'otp',
}

/** What each template interpolates. */
export interface SmsTemplateParams {
  [SmsTemplate.OTP]: { otp: string };
}

type SmsCatalog = {
  [T in SmsTemplate]: Record<
    AppLocale,
    (params: SmsTemplateParams[T]) => string
  >;
};

/**
 * The Persian wording is the wording these messages have always had. Changing
 * it is a copy decision, not a translation one — an SMS costs money and cannot
 * be un-sent.
 */
const SMS_TEMPLATES: SmsCatalog = {
  [SmsTemplate.OTP]: {
    fa: ({ otp }) => `رمز یکبار مصرف شما: ${otp}`,
    en: ({ otp }) => `Your one-time password: ${otp}`,
  },
};

/**
 * Render one SMS body. An unknown or absent locale renders Persian rather than
 * failing: a message in the wrong language still arrives, an exception here
 * would lose a login.
 */
export function renderSms<T extends SmsTemplate>(
  template: T,
  locale: string | null | undefined,
  params: SmsTemplateParams[T],
): string {
  return SMS_TEMPLATES[template][resolveLocale(locale)](params);
}
