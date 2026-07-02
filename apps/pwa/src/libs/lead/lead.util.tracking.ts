/**
 * Per-listing tracking code (mirror of the backend formula in
 * apps/core-api/src/lead/lead.tracking.ts). ad id + margin, as a plain number.
 * The margin must match the backend's `AD_CODE_MARGIN` — configured here via
 * `NEXT_PUBLIC_AD_CODE_MARGIN`.
 */

const DEFAULT_MARGIN = 200;

function getMargin(): number {
  const parsed = parseInt(process.env.NEXT_PUBLIC_AD_CODE_MARGIN ?? '', 10);
  return Number.isFinite(parsed) ? parsed : DEFAULT_MARGIN;
}

export function trackingCode(adId: number): string {
  return String(adId + getMargin());
}
