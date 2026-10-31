import { defineRouting } from 'next-intl/routing';
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  defaultLocale,
  locales,
} from './i18n.config';

/**
 * Routing rules shared by the proxy and the navigation helpers.
 *
 * `localePrefix: 'as-needed'` is the load-bearing choice here. The default
 * locale (fa) keeps unprefixed URLs — `/`, `/login`, `/dashboard` — so links
 * that already exist keep working. Additional locales get a prefix
 * (`/en/login`), which gives each language a distinct, separately cacheable
 * URL.
 *
 * `localeDetection` stays on: next-intl resolves cookie → `accept-language` →
 * default. `src/proxy.ts` layers the deploy-time override and the confidence
 * marking on top by writing the resolved value into the *request* cookie
 * before delegating here, which takes priority over `accept-language`.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: true,
  localeCookie: {
    name: LOCALE_COOKIE,
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  },
  // Emits the `Link: <...>; rel="alternate"; hreflang="..."` response header so
  // crawlers discover the other language without us hand-rolling hreflang tags.
  alternateLinks: true,
});
