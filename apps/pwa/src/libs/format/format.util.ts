import { useFormatter, useTranslations } from 'next-intl';

/**
 * Locale-aware cost formatting for amounts stored in Toman.
 *
 * Two things matter and neither is hardcoded:
 *
 *  - the locale, so the same call renders `۱۲٬۵۰۰ ت` under `fa` and
 *    `12,500 T` under `en`;
 *  - the unit's position, which is part of the message (`"{amount} ت"`) rather
 *    than concatenated onto the number, because where the unit sits relative to
 *    the amount is a translator's decision, not a developer's.
 *
 * The currency itself is deliberately *not* converted — an amount in Toman is
 * in Toman whatever language the page is in. Only its presentation changes.
 */
export function useCostFormatter() {
  const format = useFormatter();
  const t = useTranslations('format');

  /** `12500` → `۱۲٬۵۰۰ ت`, nullish or zero → `—`. */
  function formatCost(cost: number | undefined | null): string {
    if (!cost) return t('unknown');
    return t('cost', { amount: format.number(cost, 'integer') });
  }

  /** Caption under a cost: the unit when there is one, else an explanation. */
  function formatCostSubtext(cost: number | undefined | null): string {
    return cost ? t('unit') : t('noCost');
  }

  return { formatCost, formatCostSubtext };
}
