import { isLocale, type Locale } from './i18n.config';

/**
 * The global language override — the deploy-time kill switch.
 *
 * Set `LOCALE_OVERRIDE` (e.g. `fa`) and every visitor gets that language
 * regardless of their browser, cookie or URL prefix. Read from the environment
 * only, so it costs nothing at runtime and still works when the backend is the
 * thing that is broken. Empty or unrecognised means negotiate normally.
 */
export function resolveLocaleOverride(): Locale | null {
  const value = process.env.LOCALE_OVERRIDE?.trim();
  return isLocale(value) ? value : null;
}
