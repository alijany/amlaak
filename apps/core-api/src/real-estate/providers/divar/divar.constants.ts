/**
 * Divar constants, observed against the live site (gilan-province/real-estate)
 * via the Camoufox accessibility snapshots in Phase 3.
 *
 * The page exposes stable element *refs* per snapshot (e1, e2, ...), not stable
 * CSS selectors — so we locate elements by accessible name/role at runtime
 * (see divar.parser.ts) and keep only the human-readable anchors here.
 */

export const DIVAR_BASE_URL = 'https://divar.ir';

/** First target requested for the platform. */
export const DIVAR_GILAN_REAL_ESTATE_PATH = '/s/gilan-province/real-estate';

/** Province all Gilan listings belong to (not repeated per-card on the page). */
export const DIVAR_GILAN_PROVINCE = 'گیلان';

/** Ad-detail links look like `/v/<slug>/<token>` — the token is the externalId. */
export const DIVAR_AD_PATH_PREFIX = '/v/';

/** Divar serves listing photos from its CDN; thumbnails use a separate path. */
export const DIVAR_IMAGE_HOST = 'divarcdn';
/** Full-size photo path segment (vs `webp_thumbnail` for small previews). */
export const DIVAR_IMAGE_FULL_MARKER = '/webp_post/';
/** Max images to keep per ad. */
export const DIVAR_MAX_IMAGES = 8;

/**
 * Accessible-name anchors used to find refs in a snapshot. These are UI strings
 * Divar shows to users; matched as substrings so minor wording changes survive.
 */
export const DIVAR_ANCHORS = {
  /** Desktop: closes the map overlay so the list takes the full width. */
  closeMap: 'بستن نقشه',
  /** Shown once the map is already closed (used to detect state). */
  showMap: 'نمایش نقشه',
  /** Opens the login modal from an authenticated-only page. */
  loginButton: 'ورود به حساب کاربری',
  /** "Next" button that submits the phone number and triggers the OTP SMS. */
  nextButton: 'بعدی',
  /** "Confirm" button on the OTP step. */
  confirmButton: 'تأیید',
  /** Placeholder of the phone-number field. */
  phonePlaceholder: 'موبایل',
} as const;

/** A page that forces the login modal for guests (used by the auth provider). */
export const DIVAR_LOGIN_TRIGGER_PATH = '/my-divar/my-posts';

/**
 * Detail-page spec labels → normalized attribute keys. The detail page renders
 * each spec as a label paragraph immediately followed by a value paragraph.
 */
export const DIVAR_SPEC_LABELS: Record<string, string> = {
  متراژ: 'area',
  'قیمت کل': 'totalPrice',
  'قیمت ملک': 'totalPrice',
  'قیمت هر متر': 'pricePerMeter',
  ودیعه: 'deposit',
  'ودیعه پیشنهادی': 'deposit',
  اجاره: 'rent',
  'اجارهٔ ماهانه': 'rent',
  'اجاره ماهیانه': 'rent',
  اتاق: 'rooms',
  ساخت: 'yearBuilt',
  طبقه: 'floor',
};

/** Keywords that classify a listing's category from its title/meta text. */
export const DIVAR_CATEGORY_HINTS = {
  rent: ['اجاره', 'رهن', 'روزانه', 'کوتاه‌مدت', 'کوتاه مدت'],
  sale: ['فروش', 'قیمت ملک', 'قیمت کل'],
} as const;
