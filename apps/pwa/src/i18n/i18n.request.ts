import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { locale as rootLocale } from 'next/root-params';
import { BUSINESS_TIME_ZONE } from './i18n.config';
import { formats } from './i18n.formats';
import { routing } from './i18n.routing';

/**
 * Per-request i18n configuration. Wired in via `createNextIntlPlugin` in
 * `next.config.ts`.
 *
 * ── Why this reads `next/root-params` ──────────────────────────────────────
 *
 * The locale comes from `next/root-params` (stable in Next.js 16.3) rather than
 * from the `requestLocale` param, and that choice is what keeps every page
 * statically rendered *without* a `setRequestLocale` call in each one.
 *
 * next-intl passes `requestLocale` as a lazy getter, and resolving it falls
 * back to reading the `x-next-intl-locale` **header** — a dynamic API that
 * would opt every route out of prerendering. Its own source says as much:
 *
 *   > In case the consumer doesn't read `params.locale` ... don't attempt to
 *   > read the request locale.
 *
 * So this function deliberately never touches `requestLocale`. Root params are
 * known statically per prerendered route, so the header is never consulted.
 *
 * The guardrail: if this ever regresses, the symptom is silent — the build
 * summary still prints `● (SSG)` while emitting no HTML. Check
 * `.next/server/app/{fa,en}/` for the actual `.html` files, not the summary.
 *
 * The catalog is loaded with a dynamic `import()` keyed on the locale, so a
 * render only ever pulls in the language it is producing.
 *
 * Note that `locale` is the bare tag (`fa`, not `fa-IR`) and that is deliberate:
 * `Intl` resolves `fa` to the Persian numbering system *and* the Persian
 * (Jalali) calendar, so `format.number()` yields `۱۲٬۵۰۰` and `format.dateTime()`
 * yields `۱۶ مرداد ۱۴۰۵` with no per-call handling and no calendar branching.
 */
export default getRequestConfig(async () => {
  // Untrusted: `[locale]` doubles as a catch-all for unknown paths, so this can
  // be `undefined` or arbitrary text.
  const requested = await rootLocale();
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    formats,
    timeZone: BUSINESS_TIME_ZONE,
    messages: (await import(`../messages/${locale}.json`)).default,

    // A missing string is loud in development and silent in production — it
    // should never be able to take a page down.
    onError(error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
    },
    getMessageFallback({ key, namespace }) {
      const path = [namespace, key].filter(Boolean).join('.');
      return process.env.NODE_ENV === 'development' ? `⟪${path}⟫` : '';
    },
  };
});
