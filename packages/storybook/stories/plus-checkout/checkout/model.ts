import type { Cycle } from '../data';

/* The state the new checkout renders from. In production every field maps to
   something that already exists (see IMPLEMENTATION.md → "State mapping"). */

export type Purchase = 'personal' | 'gift' | 'team';

export type Method = 'card' | 'paypal' | 'apple';

/** Paddle frame lifecycle, as the page sees it through Paddle.js events. */
export type Phase =
  | 'loading' // before checkout.loaded
  | 'ready' // the frame is interactive
  | 'processing' // after the pay button, before checkout.completed
  | 'authenticating' // card needs 3-D Secure: the bank's challenge, inside Paddle's frame
  | 'declined' // checkout.payment.failed / checkout.error
  | 'blocked' // Paddle.js never loaded (ad/tracker blocker, network): no checkout.loaded
  | 'success'; // checkout.completed → success page

/** Who is looking at the page. Decides what the right half shows. */
export type Viewer =
  | 'member' // signed in, can buy
  | 'anonymous' // not signed in: auth panel instead of the frame
  | 'plus' // already Plus: manage panel, no frame
  | 'unavailable'; // region / account Paddle can't sell to

/** Where the person came from (?ref= or the clicked target). Reorders the top three. */
export type Entry =
  | 'default'
  | 'ads'
  | 'brief'
  | 'custom-feed'
  | 'clickbait'
  | 'bookmarks';

/** web = Paddle (browser, Android TWA, extension → webapp); ios = StoreKit in the iOS app. */
export type Platform = 'web' | 'ios';

export type CheckoutState = {
  platform: Platform;
  /** geo.region (ISO country). For the US, 'US-CA' style when the state is known. */
  country: string;
  cycle: Cycle;
  purchase: Purchase;
  method: Method;
  phase: Phase;
  viewer: Viewer;
  entry: Entry;
  /** A live discount (sale banner or ?discount=). */
  sale: boolean;
  /** Seats, for purchase = team. */
  seats: number;
  /** Gift recipient, for purchase = gift. */
  giftTo?: { name: string; username: string };
  /** Phones get Paddle's express variant (wallets first). */
  express: boolean;
  /** Prices still loading (usePaymentContext().isPricesPending). */
  pricesLoading?: boolean;
  /** Already Plus because someone gifted it: no Manage subscription (production hides it too). */
  giftedPlus?: boolean;
  /** Phones/tablets (< 1020px): which of the two steps is showing. Desktop shows both halves. */
  mobileStep?: 'plan' | 'payment';
};

export const initialState: CheckoutState = {
  platform: 'web',
  country: 'DE',
  cycle: 'annual',
  purchase: 'personal',
  method: 'card',
  phase: 'ready',
  viewer: 'member',
  entry: 'default',
  sale: false,
  seats: 3,
  express: false,
};
