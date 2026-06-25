/** How an agency receives a newly assigned lead. Configured by platform admins. */
export enum LeadDelivery {
  /** Push the lead to the agency's Telegram group (telegramGroupId). */
  TELEGRAM = 'telegram',
  /** SMS the lead to the agency's phone. */
  SMS = 'sms',
  /** No automatic delivery. */
  DISABLED = 'disabled',
}
