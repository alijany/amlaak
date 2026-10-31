import type { Formats } from 'next-intl';

/**
 * Shared format presets, so a date rendered in the dashboard and the same date
 * on a public page cannot drift apart. Reference them by name:
 *
 *   const format = useFormatter();
 *   format.dateTime(notification.created_at, 'short');
 *   format.number(total, 'integer');
 *
 * These resolve through `Intl` against the active locale, which is what makes
 * `fa` emit Persian digits and Jalali dates without any per-call handling.
 */
export const formats = {
  dateTime: {
    short: {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
    long: {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    },
    /** All-digit date for dense tables — `۱۴۰۵/۸/۸` / `10/30/2026`. */
    numeric: {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    },
    /** Full date, no weekday — document revision dates, timestamps in prose. */
    full: {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
    },
    /**
     * Date *and* clock time — operational timestamps, where "which day" alone
     * answers nothing: two events six hours apart are the same date and a
     * different fact.
     */
    stamp: {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    },
  },
  number: {
    /** Whole units — Toman amounts are never shown with decimals. */
    integer: {
      maximumFractionDigits: 0,
    },
    percent: {
      style: 'percent',
      maximumFractionDigits: 0,
    },
  },
} satisfies Formats;
