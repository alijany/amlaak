/**
 * Per-listing tracking code (mirror of the backend formula in
 * apps/core-api/src/lead/lead.tracking.ts). `NV-` + base36(adId).
 */
export function trackingCode(adId: number): string {
  return `NV-${adId.toString(36).toUpperCase()}`;
}
