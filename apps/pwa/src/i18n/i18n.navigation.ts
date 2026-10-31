import { createNavigation } from 'next-intl/navigation';
import { routing } from './i18n.routing';

/**
 * Locale-aware replacements for `next/link` and `next/navigation`.
 *
 * Import these instead of the Next.js originals anywhere inside `[locale]`.
 * They keep the active locale on the URL, so an English user clicking
 * `/dashboard` lands on `/en/dashboard` directly rather than hitting
 * `/dashboard` and eating a proxy redirect on every navigation.
 *
 *   import { Link, useRouter } from '@/i18n/i18n.navigation';
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
