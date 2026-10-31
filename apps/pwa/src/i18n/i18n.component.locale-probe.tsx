'use client';

import { useEffect } from 'react';
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_SOURCE_COOKIE,
  localeFromTimeZone,
  type Locale,
} from './i18n.config';

/**
 * One-shot client refinement of a weak locale guess, using the timezone.
 *
 * The timezone is not knowable at the edge — no HTTP header carries it, only
 * `Intl` in the browser does. So it cannot drive the first render without
 * making every page dynamic, which is the opposite of what we want. It is used
 * here as a *correction* instead of an input:
 *
 *   - it runs only when the edge marked its guess `weak` (i.e. the browser did
 *     not name a language we ship, so we fell back to the default),
 *   - it runs at most once per visitor — pinning the cookie makes the next
 *     request `strong`, and every later visit skips this entirely,
 *   - crawlers, which do not run JS, never reach it and always see the
 *     deterministic header-derived render.
 *
 * The concrete case it exists for: a visitor in Iran whose device locale is
 * left at `en-US`. The header implies English, `Asia/Tehran` implies Persian,
 * and Persian is the better answer.
 */

function readCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function LocaleProbe({ locale }: { locale: Locale }) {
  useEffect(() => {
    // The edge is confident, or has already been corrected — nothing to do.
    if (readCookie(LOCALE_SOURCE_COOKIE) !== 'weak') return;

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const suggested = localeFromTimeZone(timeZone);

    // Pin the outcome either way, so this runs once and not on every page view.
    const resolved = suggested ?? locale;
    document.cookie = `${LOCALE_COOKIE}=${resolved}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
    document.cookie = `${LOCALE_SOURCE_COOKIE}=strong; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;

    if (suggested && suggested !== locale) {
      // Full reload rather than a client transition: the language affects the
      // server-rendered HTML, `<html lang>` and `dir`, so the document itself
      // has to be re-fetched. The proxy honours the new cookie.
      window.location.reload();
    }
  }, [locale]);

  return null;
}
