/**
 * Per-listing tracking code. Software-only attribution mechanism: each listing
 * (advertisement) maps to a unique short code derived deterministically from its
 * id, so an inbound inquiry that references the code resolves to its listing.
 *
 * The same formula is mirrored on the frontend
 * (apps/pwa/src/libs/lead/lead.util.tracking.ts).
 */

const PREFIX = 'NV-';

/** `NV-` + base36(id). Unique because the ad id is unique. */
export function advertisementTrackingCode(id: number): string {
  return `${PREFIX}${id.toString(36).toUpperCase()}`;
}

/** Inverse of {@link advertisementTrackingCode}. Returns null if unparseable. */
export function decodeTrackingCode(code: string): number | null {
  if (!code) return null;
  const raw = code.trim().toUpperCase().replace(/^NV-?/, '');
  const id = parseInt(raw, 36);
  return Number.isFinite(id) && id > 0 ? id : null;
}
