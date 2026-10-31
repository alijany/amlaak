import * as gregorian from 'date-fns';
import * as jalali from 'date-fns-jalali';
import { BUSINESS_TIME_ZONE, type Locale } from './i18n.config';

/**
 * Calendar-system handling for date *arithmetic*.
 *
 * There are two separate jobs here and only one of them needs this module:
 *
 *  - **Display** — handled by `Intl` (via next-intl's `useFormatter`) with no
 *    help from us. `Intl` resolves `fa` to the Persian calendar and `en` to the
 *    Gregorian one on its own, so the same instant renders as `۱۹ مرداد ۱۴۰۵`
 *    or `10 August 2026` with no branching.
 *  - **Arithmetic** — what this module is for. "Start of month" and "add one
 *    month" genuinely differ between calendars: Mordad 1st is not August 1st,
 *    and a Jalali month grid does not line up with a Gregorian one. `Intl`
 *    cannot do this, so the date-fns build has to be chosen per locale.
 */

/** The subset of date-fns the calendar surfaces use. Both builds share it. */
export type CalendarFns = {
  startOfDay: (date: Date) => Date;
  endOfDay: (date: Date) => Date;
  startOfMonth: (date: Date) => Date;
  addDays: (date: Date, amount: number) => Date;
  addMonths: (date: Date, amount: number) => Date;
  eachDayOfInterval: (interval: { start: Date; end: Date }) => Date[];
  isSameDay: (a: Date, b: Date) => boolean;
  isSameMonth: (a: Date, b: Date) => boolean;
  isBefore: (a: Date, b: Date) => boolean;
};

/**
 * date-fns bound to the calendar the locale reads dates in — Jalali for
 * Persian, Gregorian for everything else.
 *
 * Listed explicitly rather than returning the module namespaces so TypeScript
 * resolves one small shape instead of a union of two very large ones.
 */
export function calendarFns(locale: Locale): CalendarFns {
  return locale === 'fa' ? jalali : gregorian;
}

/**
 * The weekday the grid opens on, as a JS day index (0 = Sunday … 6 = Saturday).
 *
 * Persian calendars start the week on Saturday; the Gregorian default here is
 * Sunday. Changing `en` to a Monday-first week is a one-line change.
 */
export function weekStartsOn(locale: Locale): number {
  return locale === 'fa' ? 6 : 0;
}

/**
 * Narrow weekday initials in grid order, derived from `Intl` rather than hand
 * written — for `fa` this reproduces the previous hardcoded
 * `['ش','ی','د','س','چ','پ','ج']` exactly, and any locale added later gets
 * correct labels for free.
 */
export function weekdayLabels(locale: Locale): string[] {
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: 'narrow',
    timeZone: 'UTC',
  });

  // 2024-01-07 was a Sunday, so this date + n lands on JS day index n.
  const sunday = Date.UTC(2024, 0, 7);
  const start = weekStartsOn(locale);

  return Array.from({ length: 7 }, (_, column) =>
    formatter.format(new Date(sunday + ((start + column) % 7) * 86_400_000))
  );
}

/** `مرداد ۱۴۰۵` / `August 2026` — the calendar's month heading. */
export function formatMonthHeading(locale: Locale, date: Date): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: BUSINESS_TIME_ZONE,
  }).format(date);
}
