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

// The currently configured Plus promotion, switched on by the `plus_sale`
// GrowthBook flag. Swapping campaigns means editing this and shipping it.
export const plusSaleCampaign = {
  /**
   * Paddle discount id (`dsc_...`). Empty keeps the sale inert even with the
   * flag on, so a half-configured campaign can't advertise a discount that
   * checkout won't honour.
   */
  discountId: '',
  /** Coupon code shown as marketing copy; it is applied automatically. */
  code: 'SUMMER50',
  label: '50% off',
  headline: 'Summer sale: 50% off Plus',
  description: 'Code SUMMER50 is already applied. Offer ends August 31.',
  /** The sale self-expires here even if the flag is left on. */
  endDate: '2026-09-01T00:00:00.000Z',
};
