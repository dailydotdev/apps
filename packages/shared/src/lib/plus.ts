export enum SubscriptionProvider {
  Paddle = 'paddle',
  AppleStoreKit = 'storekit',
}

export enum SubscriptionStatus {
  Active = 'active',
  Expired = 'expired',
  Cancelled = 'cancelled',
  None = 'none',
}

// Copy for the promotion the `plus_sale` flag switches on. The discount itself
// lives in the flag, since its id differs between Paddle environments.
export const plusSaleCampaign = {
  /** Coupon code shown as marketing copy; it is applied automatically. */
  code: 'SUMMER50',
  label: '50% off',
  headline: 'Summer sale: 50% off Plus',
  description: 'Code SUMMER50 is already applied. Offer ends August 31.',
  /** The sale self-expires here even if the flag is left on. */
  endDate: '2026-09-01T00:00:00.000Z',
};
