import { RealEstateCategory } from '../../real-estate.constants';
import {
  DIVAR_AD_PATH_PREFIX,
  DIVAR_CATEGORY_HINTS,
  DIVAR_SPEC_LABELS,
} from './divar.constants';

/**
 * Helpers for reading Camoufox accessibility snapshots of Divar pages.
 *
 * A snapshot is indented text where interactable nodes carry a stable ref, e.g.
 *   `- button " بستن نقشه" [e61]`
 *   `- link "..." [e48]:`
 *     `- /url: /v/<slug>/<token>?...`
 *     `- heading "..." [level=2]`
 *     `- text: ۴,۵۰۰,۰۰۰,۰۰۰ تومان ...`
 * Refs are per-snapshot, so everything is matched by role/name at runtime.
 */

const REF_RE = /\[(e\d+)\]/;
/** `- <role> "<name>" [eN]` */
const NAMED_RE = /^\s*-\s+(\S+)\s+"([^"]*)"\s+\[(e\d+)\]/;
/** `- <role> [eN]` (no accessible name) */
const ANON_RE = /^\s*-\s+([A-Za-z]+)\s+\[(e\d+)\]/;

export interface DivarListingCard {
  /** Token after the slug in `/v/<slug>/<token>` — the externalId. */
  token: string;
  sourceUrl: string;
  title: string;
  /** The card's price/meta line, e.g. "۲ اتاق, تا ۴ نفر از ۱,۵۰۰,۰۰۰ تومان ...". */
  metaText: string;
}

/** Find the ref of the first node whose role (and optional name) matches. */
export function findRef(
  snapshot: string,
  opts: { role?: string; nameIncludes?: string },
): string | undefined {
  for (const line of snapshot.split('\n')) {
    const named = NAMED_RE.exec(line);
    if (named) {
      const [, role, name, ref] = named;
      if (opts.role && role !== opts.role) continue;
      if (opts.nameIncludes && !name.includes(opts.nameIncludes)) continue;
      return ref;
    }
    if (!opts.nameIncludes) {
      const anon = ANON_RE.exec(line);
      if (anon) {
        const [, role, ref] = anon;
        if (opts.role && role !== opts.role) continue;
        return ref;
      }
    }
  }
  return undefined;
}

/**
 * Find a textbox ref by a placeholder substring. The placeholder appears as a
 * child line (`- /placeholder: ...`) shortly after the `textbox [eN]` line.
 */
export function findTextboxByPlaceholder(
  snapshot: string,
  placeholderIncludes: string,
): string | undefined {
  const lines = snapshot.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*-\s+textbox\b/.test(lines[i])) continue;
    const refMatch = REF_RE.exec(lines[i]);
    if (!refMatch) continue;
    for (let j = i; j < Math.min(lines.length, i + 4); j++) {
      if (
        lines[j].includes('/placeholder:') &&
        lines[j].includes(placeholderIncludes)
      ) {
        return refMatch[1];
      }
    }
  }
  // Fall back to the first textbox if no placeholder matched.
  return findRef(snapshot, { role: 'textbox' });
}

/** Parse all advertisement cards on a listing snapshot, de-duplicated by token. */
export function parseListingCards(snapshot: string): DivarListingCard[] {
  const lines = snapshot.split('\n');
  const cards: DivarListingCard[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const urlMatch = /\/url:\s*(\/v\/\S+)/.exec(lines[i]);
    if (!urlMatch) continue;

    const path = urlMatch[1].split('?')[0].replace(/\/+$/, '');
    if (!path.startsWith(DIVAR_AD_PATH_PREFIX)) continue;
    const token = decodeURIComponent(path.split('/').pop() ?? '');
    if (!token || seen.has(token)) continue;

    // Title = first heading after the url; metaText = first text node after it.
    let title = '';
    let metaText = '';
    for (let j = i + 1; j < Math.min(lines.length, i + 6); j++) {
      const h = /^\s*-\s+heading\s+"([^"]*)"/.exec(lines[j]);
      if (h && !title) title = h[1].trim();
      const t = /^\s*-\s+text:\s*(.+)$/.exec(lines[j]);
      if (t && !metaText && !/^\s*[\d۰-۹]+\s*$/.test(t[1])) {
        metaText = t[1].trim();
      }
    }
    if (!title) {
      // Fall back to the link's accessible name on the preceding line.
      const named = NAMED_RE.exec(lines[i - 1] ?? '');
      title = named ? named[2].trim() : token;
    }

    seen.add(token);
    cards.push({
      token,
      sourceUrl: `https://divar.ir${path}`,
      title,
      metaText,
    });
  }

  return cards;
}

/**
 * Parse the detail page's spec table. Each spec is a label paragraph followed
 * by a value paragraph; only known labels (see {@link DIVAR_SPEC_LABELS}) are
 * mapped to normalized attribute keys.
 */
export function parseDetailSpecs(snapshot: string): Record<string, string> {
  const lines = snapshot.split('\n');
  const out: Record<string, string> = {};
  const paraRe = /^\s*-\s+paragraph:\s*(.+)$/;

  for (let i = 0; i < lines.length - 1; i++) {
    const label = paraRe.exec(lines[i]);
    if (!label) continue;
    const key = DIVAR_SPEC_LABELS[label[1].trim()];
    if (!key || out[key]) continue;
    const valueLine = paraRe.exec(lines[i + 1]);
    if (valueLine) out[key] = valueLine[1].trim();
  }
  return out;
}

/** Classify a listing from its combined title + meta text. */
export function inferCategory(text: string): RealEstateCategory {
  if (DIVAR_CATEGORY_HINTS.rent.some((k) => text.includes(k))) {
    return RealEstateCategory.RENT;
  }
  if (DIVAR_CATEGORY_HINTS.sale.some((k) => text.includes(k))) {
    return RealEstateCategory.SALE;
  }
  return RealEstateCategory.UNKNOWN;
}

/** Extract the first `<number> متر` area mention from a card's text, if any. */
export function extractAreaFromText(text: string): string | undefined {
  const m = /([\d۰-۹,]+)\s*متر/.exec(text);
  return m ? m[1] : undefined;
}

/** Extract `<number> اتاق` (rooms) from a card's text, if any. */
export function extractRoomsFromText(text: string): string | undefined {
  const m = /([\d۰-۹]+)\s*اتاق/.exec(text);
  return m ? m[1] : undefined;
}
