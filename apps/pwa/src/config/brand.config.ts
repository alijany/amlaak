// ─── Brand Configuration ───────────────────────────────────────────────────
// Language-independent identity and contact values live here.
//
// Everything a reader reads is localized and lives in the message catalogs
// (`src/messages/fa.json`, then `en.json`): the brand name (`common.brand`),
// page metadata (`meta`), landing-page copy (`landing`), and footer copy and
// address (`footer`). Rebranding means editing this file and those keys.

export const brand = {
  // ── Contact ───────────────────────────────────────────────────────────────
  contact: {
    phone: { primary: '+989104007068', display: '0910 400 7068' },
    phone2: { primary: '+981333352174', display: '013 3335 2174' },
  },
} as const;
