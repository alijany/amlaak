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
  /**
   * Detail page: shows the seller's contact section (requires auth).
   * When clicked while logged in, the page scrolls to / reveals phone numbers.
   */
  contactInfo: 'اطلاعات تماس',
  /** Secondary reveal step inside the contact section (sometimes present). */
  showPhone: 'نمایش شماره',
} as const;

/** A page that forces the login modal for guests (used by the auth provider). */
export const DIVAR_LOGIN_TRIGGER_PATH = '/my-divar/my-posts';

/**
 * Detail-page spec labels → normalized attribute keys.
 *
 * The detail page renders specs in two ways:
 *   a) A table with `columnheader` labels and `cell` values (top 3: area/year/rooms).
 *   b) Label–value paragraph pairs for the remaining specs.
 * Both formats map through the same label table here.
 */
export const DIVAR_SPEC_LABELS: Record<string, string> = {
  متراژ: 'area',
  زیربنا: 'area',
  'متراژ زمین': 'landArea',
  عرصه: 'landArea',
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
  'سال ساخت': 'yearBuilt',
  'عمر بنا': 'buildingAge',
  طبقه: 'floor',
  'نوع ملک': 'propertyType',
  'وضعیت سند': 'documentType',
  'وضعیت کابینت': 'cabinetCondition',
  'وضعیت سرویس بهداشتی': 'bathroomCondition',
  'وضعیت کف': 'floorCondition',
  'وضعیت نما': 'facadeCondition',
  وام: 'loan',
};

/** Keywords that classify a listing's category from its title/meta text. */
export const DIVAR_CATEGORY_HINTS = {
  rent: [
    'اجاره',
    'رهن',
    'روزانه',
    'کوتاه‌مدت',
    'کوتاه مدت',
    'رهن کامل',
    'رهن و اجاره',
  ],
  sale: ['فروش', 'قیمت ملک', 'قیمت کل', 'پیش‌فروش', 'فروشی'],
} as const;

/**
 * Breadcrumb `/s/<province>/<segment>` path segments that indicate a rental.
 * Observed live on gilan-province; other provinces use the same slugs.
 */
export const DIVAR_RENT_PATH_SEGMENTS = new Set([
  'rent-residential',
  'rent-commercial-property',
  'rent-temporary',
  // legacy / alternate slugs seen in the wild
  'rent-apartment',
  'rent-villa',
  'rent-house',
  'rent-office',
  'rent-shop',
  'short-rent',
]);

/**
 * Breadcrumb path segments that indicate a for-sale listing.
 * These appear as the second or third segment of `/s/<province>/…`.
 */
export const DIVAR_SALE_PATH_SEGMENTS = new Set([
  'buy-residential',
  'buy-villa',
  'buy-commercial-property',
  'buy-land',
  'buy-store',
  // legacy / alternate slugs
  'apartment',
  'villa',
  'land',
  'office',
  'shop',
  'pre-sell',
]);

/**
 * Card-level promotion badge texts embedded in the meta line on listing cards.
 * These are injected into the `text:` node alongside the price — the parser
 * strips them so the cleaned price/meta line is stored.
 */
export const DIVAR_PROMOTED_LABELS = ['پله شده', 'نردبان شده'];

/** Text node label that precedes the initial amenities table on a detail page. */
export const DIVAR_AMENITIES_TEXT = 'ویژگی‌ها و امکانات';

/** Text inside the button that expands additional amenities. */
export const DIVAR_AMENITIES_MORE = 'سایر ویژگی‌ها و امکانات';

/** Heading that introduces the description block on a detail page. */
export const DIVAR_DESCRIPTION_HEADING = 'توضیحات';

/**
 * URL path prefix for agency/professional profile pages on Divar.
 * Detail pages with a `link /url: /pro/<id>` block belong to a real-estate agency.
 */
export const DIVAR_AGENCY_PRO_PATH = '/pro/';
