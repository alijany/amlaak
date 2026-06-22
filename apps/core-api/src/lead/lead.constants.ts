/**
 * Lead domain constants. A lead is an inbound inquiry attributed to a listing
 * (real-estate advertisement) and tracked from first contact to conversion.
 */

/** Lifecycle of a lead (ordered NEW → CONTACTED → QUALIFIED → WON/LOST). */
export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  WON = 'won',
  LOST = 'lost',
}

/** Where the inquiry came from. */
export enum LeadSource {
  PHONE_CALL = 'phone_call',
  TELEGRAM = 'telegram',
  INSTAGRAM = 'instagram',
  WEBSITE = 'website',
  REFERRAL = 'referral',
  OTHER = 'other',
}
