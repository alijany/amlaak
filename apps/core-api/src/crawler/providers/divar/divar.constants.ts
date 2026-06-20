/**
 * Divar-specific constants.
 *
 * IMPORTANT: nothing here should be treated as a verified description of
 * Divar's real structure. These are placeholders/extension points for a future
 * phase that has live browser access. Do not couple logic to selector strings
 * until they are confirmed against the running site.
 */

export const DIVAR_BASE_URL = 'https://divar.ir';

/** First target requested for the platform. */
export const DIVAR_GILAN_REAL_ESTATE_PATH = '/s/gilan-province/real-estate';

/**
 * Placeholder selector/ref map. Real implementations should resolve these from
 * accessibility snapshots (element refs) rather than CSS selectors where
 * possible. Left empty intentionally — to be filled when the site is observed.
 */
export const DIVAR_SELECTORS = {
  login: {
    phoneInput: '',
    submitButton: '',
    otpInput: '',
    verifyButton: '',
  },
  listing: {
    card: '',
    title: '',
    price: '',
  },
} as const;
