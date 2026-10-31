/**
 * The languages the platform speaks, on the backend side.
 *
 * The PWA negotiates the locale at the edge and expresses it as a URL prefix
 * (`docs/engine/localization.md`). Nothing here re-negotiates: the backend only
 * ever receives a locale someone already decided, and uses it to write an
 * out-of-band message — which has no browser to render it — in the right
 * language.
 */
export const SUPPORTED_LOCALES = ['fa', 'en'] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

/** Persian is the product's default and the answer to every unknown. */
export const DEFAULT_LOCALE: AppLocale = 'fa';

/** Whether this is a language we actually ship — as opposed to one we default. */
export function isSupportedLocale(value?: string | null): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

/**
 * Narrow anything — a DTO field, a missing value, a stale client — to a locale
 * we can render. Absent, unrecognised or malformed means `fa`.
 *
 * Use this to *render*, never to record: it answers "what language do I write
 * in", and its answer for an unknown input is a default, not a fact about the
 * reader.
 */
export function resolveLocale(value?: string | null): AppLocale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}
