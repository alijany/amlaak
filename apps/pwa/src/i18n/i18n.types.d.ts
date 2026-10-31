import type messages from '../messages/fa.json';
import type { formats } from './i18n.formats';
import type { locales } from './i18n.config';

/**
 * Makes next-intl's APIs aware of this app's locales, message keys and format
 * names. With this in place `useTranslations('nav')` autocompletes its keys and
 * a typo fails `pnpm lint` rather than rendering an empty string at runtime.
 *
 * The default locale's catalog is the source of truth for the key shape — any
 * other catalog missing a key is a type error in `i18n.request.ts`.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof locales)[number];
    Messages: typeof messages;
    Formats: typeof formats;
  }
}
