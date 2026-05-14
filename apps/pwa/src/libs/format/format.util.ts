/**
 * Format a cost value in Toman with Persian numerals
 * @param cost - The cost value in Toman (IRT)
 * @returns Formatted string like "۱۲۳ ت" or "—" if no cost
 */
export function formatCost(cost: number | undefined | null): string {
  if (!cost || cost === 0) {
    return '—';
  }
  return `${cost.toLocaleString('fa-IR')} ت`;
}

/**
 * Format a cost value with descriptive text
 * @param cost - The cost value in Toman (IRT)
 * @param hasDataText - Text to show when there is data
 * @param noDataText - Text to show when there is no data
 * @returns Formatted description
 */
export function formatCostSubtext(
  cost: number | undefined | null,
  hasDataText: string = 'تومان',
  noDataText: string = 'هنوز هزینه‌ای نیست'
): string {
  if (!cost || cost === 0) {
    return noDataText;
  }
  return hasDataText;
}
