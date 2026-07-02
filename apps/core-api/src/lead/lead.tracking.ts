/**
 * Per-listing tracking code. Software-only attribution mechanism: each listing
 * (advertisement) maps to a unique short code derived deterministically from its
 * id, so an inbound inquiry that references the code resolves to its listing.
 *
 * The code is the ad id offset by a configurable margin (`AD_CODE_MARGIN`, e.g.
 * `+200`) so it doesn't read as a raw sequential id, while staying a plain
 * number (no prefix/letters) — easy to say over the phone or use as a hashtag.
 *
 * The same formula is mirrored on the frontend
 * (apps/pwa/src/libs/lead/lead.util.tracking.ts), which reads the margin from
 * `NEXT_PUBLIC_AD_CODE_MARGIN` — keep the two in sync.
 */

const DEFAULT_MARGIN = 200;

function getMargin(): number {
  const parsed = parseInt(process.env.AD_CODE_MARGIN ?? '', 10);
  return Number.isFinite(parsed) ? parsed : DEFAULT_MARGIN;
}

/** ad id + margin, as a plain numeric string. */
export function advertisementTrackingCode(id: number): string {
  return String(id + getMargin());
}

/** Inverse of {@link advertisementTrackingCode}. Returns null if unparseable. */
export function decodeTrackingCode(code: string): number | null {
  if (!code) return null;
  const raw = code.trim();
  if (!/^\d+$/.test(raw)) return null;
  const id = parseInt(raw, 10) - getMargin();
  return Number.isFinite(id) && id > 0 ? id : null;
}
