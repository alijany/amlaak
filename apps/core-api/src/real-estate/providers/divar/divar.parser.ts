import { RealEstateCategory } from '../../real-estate.constants';
import {
  DIVAR_AD_PATH_PREFIX,
  DIVAR_AMENITIES_MORE,
  DIVAR_AMENITIES_TEXT,
  DIVAR_CATEGORY_HINTS,
  DIVAR_DESCRIPTION_HEADING,
  DIVAR_PROMOTED_LABELS,
  DIVAR_RENT_PATH_SEGMENTS,
  DIVAR_SALE_PATH_SEGMENTS,
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

/**
 * Strip promotion badge labels (پله شده / نردبان شده) that Divar injects into
 * the card's price/meta text line, e.g.:
 *   "۱,۱۰۰,۰۰۰,۰۰۰ تومان پله شده در احمد گوراب"
 * becomes:
 *   "۱,۱۰۰,۰۰۰,۰۰۰ تومان در احمد گوراب"
 */
function stripPromotionLabels(text: string): string {
  let out = text;
  for (const label of DIVAR_PROMOTED_LABELS) {
    out = out.replace(label, '').replace(/\s{2,}/g, ' ');
  }
  return out.trim();
}

/**
 * Parse all advertisement cards on a listing snapshot, de-duplicated by token.
 *
 * Promoted cards (پله شده / نردبان شده) appear at the top of the feed with the
 * badge text embedded inside the price/meta line and as a separate short text
 * node at the end of the card. The parser:
 *   - strips badge labels from the meta text so only the price survives
 *   - skips very short text nodes (≤ 6 chars) that are badge abbreviations
 *   - deduplicates by token so promoted duplicates are never returned twice
 */
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

    // Look ahead up to 10 lines to handle extra nodes on promoted cards.
    let title = '';
    let metaText = '';
    for (let j = i + 1; j < Math.min(lines.length, i + 10); j++) {
      if (!title) {
        const h = /^\s*-\s+heading\s+"([^"]*)"/.exec(lines[j]);
        if (h) {
          title = h[1].trim();
          continue;
        }
      }
      if (!metaText) {
        const t = /^\s*-\s+text:\s*(.+)$/.exec(lines[j]);
        if (t) {
          const raw = t[1].trim();
          // Skip pure-digit lines (view counts) and very short badge fragments.
          if (/^\s*[\d۰-۹]+\s*$/.test(raw) || raw.length <= 6) continue;
          metaText = stripPromotionLabels(raw);
        }
      }
      if (title && metaText) break;
    }

    if (!title) {
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
 * Parse the detail page specs. Two formats coexist:
 *
 * 1. **Table format** (top 3 — area, year, rooms):
 *    ```
 *    - table:
 *      - rowgroup:
 *        - row "متراژ ساخت اتاق":
 *          - columnheader "متراژ"
 *          - columnheader "ساخت"
 *          - columnheader "اتاق"
 *      - rowgroup:
 *        - row "۹۵ ۱۴۰۴ ۲":
 *          - cell "۹۵"
 *          - cell "۱۴۰۴"
 *          - cell "۲"
 *    ```
 *
 * 2. **Paragraph pairs** (remaining specs):
 *    ```
 *    - paragraph: متراژ زمین
 *    - paragraph: ۱۴۰ متر مربع
 *    ```
 *
 * Only known labels (see {@link DIVAR_SPEC_LABELS}) are emitted.
 */
export function parseDetailSpecs(snapshot: string): Record<string, string> {
  const lines = snapshot.split('\n');
  const out: Record<string, string> = {};

  // ── 1. table format ──────────────────────────────────────────────────────
  let headers: string[] = [];
  let expectCells = false;

  for (const line of lines) {
    const header = /^\s*-\s+columnheader\s+"([^"]*)"/.exec(line);
    if (header) {
      if (!expectCells) {
        headers = [];
        expectCells = true;
      }
      headers.push(header[1].trim());
      continue;
    }
    if (expectCells) {
      const cell = /^\s*-\s+cell\s+"([^"]*)"/.exec(line);
      if (cell) {
        const label = headers.shift();
        if (label) {
          const key = DIVAR_SPEC_LABELS[label];
          if (key && !out[key]) out[key] = cell[1].trim();
        }
        if (headers.length === 0) expectCells = false;
        continue;
      }
      // Non-cell line: reset table state.
      expectCells = false;
      headers = [];
    }
  }

  // ── 2. paragraph pairs ────────────────────────────────────────────────────
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

/**
 * Extract the free-text description after the "توضیحات" heading.
 * Multiple consecutive paragraphs are joined with newlines.
 */
export function parseDetailDescription(snapshot: string): string | undefined {
  const lines = snapshot.split('\n');
  let collecting = false;
  const parts: string[] = [];

  for (const line of lines) {
    const hMatch = /^\s*-\s+heading\s+"([^"]*)"/.exec(line);
    if (hMatch) {
      if (collecting) break;
      collecting = hMatch[1].includes(DIVAR_DESCRIPTION_HEADING);
      continue;
    }
    if (!collecting) continue;

    const para = /^\s*-\s+paragraph:\s*(.+)$/.exec(line);
    if (para) {
      parts.push(para[1].trim());
      continue;
    }
    const txt = /^\s*-\s+text:\s*(.+)$/.exec(line);
    if (txt && txt[1].trim().length > 5) parts.push(txt[1].trim());
  }

  const joined = parts.join('\n').trim();
  return joined.length > 0 ? joined : undefined;
}

/**
 * Extract the amenities list from a detail page.
 *
 * The initial set appears as table cells immediately after the
 * `text: ویژگی‌ها و امکانات` label.  Additional amenities (if any) are
 * revealed by clicking the "سایر ویژگی‌ها و امکانات" button — the caller is
 * responsible for clicking that button before calling this function if it wants
 * the extended list.  Both sources are merged here by scanning:
 *   - `cell "…"` rows in the amenities table
 *   - `listitem "…"` nodes after an amenities heading/text
 *   - `text:` nodes immediately after the expanded button
 */
export function parseDetailAmenities(snapshot: string): string[] {
  const lines = snapshot.split('\n');
  const items: string[] = [];
  const seen = new Set<string>();
  let inAmenitiesTable = false;
  let inAmenitiesExpanded = false;

  const add = (v: string) => {
    const s = v.trim();
    if (s && s.length > 1 && s.length < 60 && !seen.has(s)) {
      seen.add(s);
      items.push(s);
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect start of the initial amenities table.
    if (!inAmenitiesTable && line.includes(`text: ${DIVAR_AMENITIES_TEXT}`)) {
      inAmenitiesTable = true;
      continue;
    }

    // Detect the "سایر ویژگی‌ها" expanded section (button or heading).
    if (line.includes(DIVAR_AMENITIES_MORE)) {
      inAmenitiesExpanded = true;
      inAmenitiesTable = false;
      continue;
    }

    if (inAmenitiesTable) {
      // Table cells hold the feature names.
      const cellMatch = /^\s*-\s+cell\s+"([^"]+)"/.exec(line);
      if (cellMatch) {
        add(cellMatch[1]);
        continue;
      }
      // Stop when we reach the next major section.
      if (/^\s*-\s+(?:heading|button|navigation)\b/.test(line))
        inAmenitiesTable = false;
    }

    if (inAmenitiesExpanded) {
      const li = /^\s*-\s+listitem\s+"([^"]+)"/.exec(line);
      if (li) {
        add(li[1]);
        continue;
      }
      const para = /^\s*-\s+paragraph:\s*(.+)$/.exec(line);
      if (para) {
        add(para[1]);
        continue;
      }
      const txt = /^\s*-\s+text:\s*(.+)$/.exec(line);
      if (txt) {
        add(txt[1]);
        continue;
      }
      // Next heading ends the expanded section.
      if (/^\s*-\s+heading\b/.test(line)) inAmenitiesExpanded = false;
    }
  }

  return items;
}

/**
 * Infer listing category from breadcrumb `/s/` URL path segments.
 * Observed live: `buy-residential` → SALE, `rent-residential` → RENT, etc.
 */
export function parseBreadcrumbCategory(
  snapshot: string,
): RealEstateCategory | undefined {
  for (const line of snapshot.split('\n')) {
    const urlMatch = /\/url:\s*(\/s\/[^\s?]+)/.exec(line);
    if (!urlMatch) continue;
    const parts = urlMatch[1].split('/').filter(Boolean);
    // parts = ['s', '<province>', '<segment>'] or ['s', '<province>', 'real-estate', '<segment>']
    for (const part of parts) {
      if (DIVAR_RENT_PATH_SEGMENTS.has(part)) return RealEstateCategory.RENT;
      if (DIVAR_SALE_PATH_SEGMENTS.has(part)) return RealEstateCategory.SALE;
    }
  }
  return undefined;
}

/**
 * Extract the property subtype label from the last breadcrumb link's accessible
 * name (the link text shown to users), e.g. "فروش خانه و ویلا" or "اجارهٔ مسکونی".
 */
export function parseBreadcrumbSubtype(snapshot: string): string | undefined {
  const lines = snapshot.split('\n');
  let inBreadcrumbs = false;
  let lastLinkName: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    // Detect breadcrumb navigation block.
    if (!inBreadcrumbs) {
      if (/navigation\s+"breadcrumbs"/.test(lines[i])) inBreadcrumbs = true;
      continue;
    }
    // End of breadcrumb block on dedented major landmark.
    if (
      /^\s*-\s+(?:article|section|main|complementary|contentinfo|banner)\b/.test(
        lines[i],
      )
    )
      break;

    const named = NAMED_RE.exec(lines[i]);
    if (named && named[1] === 'link') {
      const name = named[2].trim();
      // Skip home/generic links.
      if (
        name &&
        name !== 'خانه' &&
        name !== 'صفحه اصلی' &&
        name !== 'نشان دیوار'
      ) {
        lastLinkName = name;
      }
    }
  }

  return lastLinkName;
}

/**
 * Extract city/district from the time+location button on a detail page.
 *
 * Divar renders a button like:
 *   `button "دقایقی پیش در چاف و چمخاله" [eN]:`
 *     `paragraph: دقایقی پیش در چاف و چمخاله`
 *
 * The pattern `در <location>` at the end of this text gives the city/district.
 */
export function parseBreadcrumbLocation(snapshot: string): {
  city?: string;
  district?: string;
} {
  for (const line of snapshot.split('\n')) {
    // Match the paragraph inside the time button.
    const para = /^\s*-\s+paragraph:\s*(.+)$/.exec(line);
    if (!para) continue;
    const text = para[1];
    // Pattern: "… در <location>" where location may contain spaces.
    const locMatch = /\bدر\s+(.+)$/.exec(text);
    if (!locMatch) continue;
    const location = locMatch[1].trim();
    // Reject very long strings (likely descriptions, not location names).
    if (location.length > 40 || location.length < 2) continue;
    // Split on " , " or "،" to separate city from district if present.
    const parts = location
      .split(/[،,]/)
      .map((p) => p.trim())
      .filter(Boolean);
    return { city: parts[0], district: parts[1] };
  }
  return {};
}

/**
 * Extract the first Iranian mobile phone number from a snapshot.
 * Handles Persian (۰–۹), Arabic-Indic (٠–٩), and ASCII digits, with optional
 * dash/space separators.  Returns the number as plain ASCII digits.
 */
export function parseContactPhone(snapshot: string): string | undefined {
  // Normalize Persian/Arabic-Indic digits to ASCII.
  const ascii = snapshot
    .replace(/[۰٠]/g, '0')
    .replace(/[۱١]/g, '1')
    .replace(/[۲٢]/g, '2')
    .replace(/[۳٣]/g, '3')
    .replace(/[۴٤]/g, '4')
    .replace(/[۵٥]/g, '5')
    .replace(/[۶٦]/g, '6')
    .replace(/[۷٧]/g, '7')
    .replace(/[۸٨]/g, '8')
    .replace(/[۹٩]/g, '9');

  // Match 09xxxxxxxxx with optional dashes/spaces between digit groups.
  for (const line of ascii.split('\n')) {
    const clean = line.replace(/[-\s]/g, '');
    const m = /09\d{9}/.exec(clean);
    if (m) return m[0];
  }
  return undefined;
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
