import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_SOURCE_COOKIE,
  defaultLocale,
  isLocale,
  type Locale,
} from '@/i18n/i18n.config';
import { routing } from '@/i18n/i18n.routing';
import { negotiationConfidence } from '@/i18n/i18n.util.negotiate';
import { resolveLocaleOverride } from '@/i18n/i18n.util.override';

/**
 * Locale negotiation, done once at the edge.
 *
 * Lives in `proxy.ts` rather than `middleware.ts`: Next.js 16 renamed the file
 * convention. Same execution model, same position in front of the cache.
 *
 * This is the whole reason the app can stay statically rendered. The language
 * is decided *before* the cache is consulted and expressed as a URL, so every
 * page below is a plain per-locale static render rather than a per-request SSR
 * that has to inspect headers. Nothing downstream reads `accept-language`.
 *
 * Precedence:
 *   1. global override        (`LOCALE_OVERRIDE` env var)
 *   2. `/en/...` URL prefix   (explicit link, crawler, hreflang alternate)
 *   3. `NEXT_LOCALE` cookie   (an earlier negotiation, or the timezone probe)
 *   4. `accept-language`      (the common first-visit path)
 *   5. default locale
 *
 * Steps 2–5 are next-intl's own resolution order; we layer 1 on top and record
 * how confident 4 was for the timezone probe to pick up.
 */

const intlMiddleware = createMiddleware(routing);

const cookieOptions = {
  maxAge: LOCALE_COOKIE_MAX_AGE,
  sameSite: 'lax',
  path: '/',
} as const;

/** `/en/login` → `/login`. Leaves already-unprefixed paths alone. */
function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split('/');
  if (isLocale(segments[1])) {
    const rest = segments.slice(2).join('/');
    return rest ? `/${rest}` : '/';
  }
  return pathname;
}

/** Applies the `as-needed` prefix rule: the default locale stays unprefixed. */
function localePath(pathname: string, locale: Locale): string {
  if (locale === defaultLocale) return pathname;
  return pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
}

export default function proxy(request: NextRequest) {
  const override = resolveLocaleOverride();

  if (override) {
    // A URL prefix outranks the cookie inside next-intl, so pinning the cookie
    // alone would still let a bookmarked `/en/...` defeat a global override.
    // Redirect such URLs onto the override's path first.
    const target = localePath(stripLocalePrefix(request.nextUrl.pathname), override);

    if (target !== request.nextUrl.pathname) {
      const url = new URL(request.nextUrl);
      url.pathname = target;
      const redirect = NextResponse.redirect(url);
      redirect.cookies.set(LOCALE_COOKIE, override, cookieOptions);
      return redirect;
    }

    // Highest-priority input next-intl accepts, so it agrees with our decision.
    request.cookies.set(LOCALE_COOKIE, override);
    const response = intlMiddleware(request);
    response.cookies.set(LOCALE_COOKIE, override, cookieOptions);
    // 'strong' stops the timezone probe from second-guessing an operator decision.
    response.cookies.set(LOCALE_SOURCE_COOKIE, 'strong', cookieOptions);
    return response;
  }

  const response = intlMiddleware(request);
  response.cookies.set(
    LOCALE_SOURCE_COOKIE,
    negotiationConfidence(request.headers.get('accept-language')),
    cookieOptions
  );
  return response;
}

export const config = {
  /*
   * Page routes only. Keeping `_next`, the proxied API and anything with a file
   * extension out of the matcher means the proxy does not run per asset —
   * it costs one invocation per navigation, not per request.
   */
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
