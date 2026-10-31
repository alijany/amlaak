// ─── Locale Configuration ──────────────────────────────────────────────────
// The single knob file for languages. Adding a language means: add it to
// `locales`, add its direction below, and add `src/messages/<locale>.json`.
// Nothing else in the app hardcodes a language.
//
// Design note — the user never picks a language. There is deliberately no
// switcher component anywhere in the UI. The locale is negotiated once at the
// edge (see `src/proxy.ts`) and pinned to a cookie. The `/<locale>` URL prefix
// exists as a *cache key*, not as a user-facing choice: it is what lets every
// page stay statically rendered per locale instead of collapsing to per-request
// SSR. See `docs/engine/localization.md`.

export const locales = ['fa', 'en'] as const;

export type Locale = (typeof locales)[number];

/** Served when negotiation finds nothing better. Keeps its URLs unprefixed. */
export const defaultLocale: Locale = 'fa';

/** Writing direction per locale — drives `<html dir>` and the bidi utilities. */
export const localeDirection: Readonly<Record<Locale, 'rtl' | 'ltr'>> = {
  fa: 'rtl',
  en: 'ltr',
};

/**
 * Timezone all server-rendered dates are formatted in.
 *
 * Fixed on purpose. Without it, the server formats in the container's zone and
 * the browser in the visitor's, which produces hydration mismatches on any
 * rendered date — and it would make date output request-dependent, which is
 * exactly what breaks static rendering. Set it to the zone the business
 * operates in.
 */
export const BUSINESS_TIME_ZONE = 'Asia/Tehran';

/**
 * IANA timezone → locale, used only to refine a *weak* negotiation result.
 *
 * Rationale: `Accept-Language` is the stronger signal for language and is the
 * primary input. Timezone earns its place in one specific case — a user in
 * Iran whose device locale is left at `en-US`. The header says English, the
 * timezone says Tehran, and Persian is the better answer. Anything not listed
 * here returns `null` and changes nothing.
 */
export const timezoneLocaleMap: Readonly<Record<string, Locale>> = {
  'Asia/Tehran': 'fa',
  'Asia/Kabul': 'fa',
};

/** Persisted negotiation result. Name matches next-intl's default. */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

/**
 * Marks how confident the edge negotiation was. Read by the client-side
 * timezone probe, which only acts on `weak`. A cookie rather than a response
 * header on purpose: reading `headers()` in a layout would opt the whole route
 * out of static rendering.
 */
export const LOCALE_SOURCE_COOKIE = 'locale_src';

export type LocaleConfidence = 'strong' | 'weak';

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/** Maps an IANA timezone to a locale, or `null` when it implies nothing. */
export function localeFromTimeZone(timeZone: string | undefined): Locale | null {
  if (!timeZone) return null;
  return timezoneLocaleMap[timeZone] ?? null;
}

/**
 * Namespaces the root layout serialises into every page's HTML for client
 * components. Kept small on purpose — the full catalog would ship on every
 * route — and limited to strings the shared chrome and shared `ui/` components
 * actually need.
 *
 * An area that wants more must send *these plus its own*. A nested
 * `NextIntlClientProvider` inherits `locale`, `timeZone` and `formats` from its
 * parent, but a `messages` prop **replaces** the inherited catalog rather than
 * merging into it — so picking only the area namespace silently strips these
 * from the whole subtree. See `dashboard/layout.tsx` for the pattern.
 */
export const ROOT_CLIENT_NAMESPACES = [
  'common',
  'nav',
  'footer',
  'format',
  'calendar',
] as const;

/**
 * Params shape for anything under `app/[locale]`.
 *
 * `locale` is typed as `Locale` rather than `string` because the root layout
 * already validates the segment and calls `notFound()` on anything invalid —
 * by the time a page renders it cannot be arbitrary text, so pages should not
 * repeat that check.
 */
export type LocalePageProps = {
  params: Promise<{ locale: Locale }>;
};
