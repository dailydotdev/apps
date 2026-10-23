import type { PrototypeArgs } from './checkout/Prototype';

/* Every use case of the new checkout, in one list. "3. Use cases" renders each
   as its own story; the overview, the flow map and the breakpoints page embed
   them by story id. Add a case here and as an export in UseCases.stories.tsx. */

export type UseCase = {
  /** Export name in UseCases.stories.tsx. */
  exportName: string;
  name: string;
  group: 'Plan' | 'Entry point' | 'Purchase' | 'Viewer' | 'Payment state' | 'After' | 'Platform' | 'Region' | 'Open decision';
  args: PrototypeArgs;
  /** What triggers it in production and what differs. */
  when: string;
};

const giftTo = { name: 'Alex Rivera', username: 'alexr' };

export const useCases: UseCase[] = [
  { exportName: 'Annual', name: 'Annual (default)', group: 'Plan', args: {}, when: 'Every signed-in visit. Annual is preselected (most buyers pick it). Set in Germany: the reminder row shows because Paddle sends one in the EU.' },
  { exportName: 'Monthly', name: 'Monthly', group: 'Plan', args: { cycle: 'monthly' }, when: 'Monthly selected. Price, bill, renewal line and Paddle’s line all switch; no struck price.' },
  { exportName: 'PhoneStep2', name: 'Phone · step 2 (payment)', group: 'Plan', args: { mobileStep: 'payment' }, when: 'Below 1020px the checkout is two steps on one address: plan → Continue → this. Collapsed order summary with Change, then Paddle. Back returns to the plan. On desktop this story looks like Annual (both halves).' },
  { exportName: 'StaticList', name: 'Static feature list (12 Oct)', group: 'Plan', args: { featureList: 'static' }, when: 'The approved 12 Oct checklist without scenes. Kept as the fallback if #6868 doesn’t ship; one screen at 1280×800.' },
  { exportName: 'PricesLoading', name: 'Prices loading', group: 'Plan', args: { pricesLoading: true }, when: 'isPricesPending: the price, cycle lines and bill are skeletons at their real sizes; Paddle waits for a price. Today: grey radio blocks.' },
  { exportName: 'FromAd', name: 'From an ad (“Remove”)', group: 'Entry point', args: { entry: 'ads' }, when: '?ref=ads from RemoveAd. Ad-free leads the list. The biggest entry point, and the one that converts worst today.' },
  { exportName: 'FromBrief', name: 'From a Briefing', group: 'Entry point', args: { entry: 'brief' }, when: '?ref=brief from BriefPlusUpgradeCTA / BriefPostContent.' },
  { exportName: 'FromCustomFeed', name: 'From the custom-feed limit', group: 'Entry point', args: { entry: 'custom-feed' }, when: '?ref=custom-feed from FeedSettings (button, edit header, save).' },
  { exportName: 'FromClickbait', name: 'From the clickbait shield', group: 'Entry point', args: { entry: 'clickbait' }, when: '?ref=clickbait from ClickbaitShieldModal / PostUpgradeToPlus.' },
  { exportName: 'FromBookmarks', name: 'From bookmark folders', group: 'Entry point', args: { entry: 'bookmarks' }, when: '?ref=bookmarks from BookmarkFoldersStrip / BookmarkFolderModal.' },
  { exportName: 'Sale', name: 'Sale running', group: 'Purchase', args: { sale: true }, when: 'usePlusSale() active (plus_sale_campaign). Strip on top, struck price, discount prefilled in Paddle.' },
  { exportName: 'Gift', name: 'Gift', group: 'Purchase', args: { purchase: 'gift', giftTo }, when: '/plus?gift=<userId> (GiftPlusModal). One-time giftOneYear price, no cycle choice, no renewal.' },
  { exportName: 'Team', name: 'Team', group: 'Purchase', args: { purchase: 'team', seats: 3 }, when: '?type=team. Seat stepper (PlusAdjustQuantity), price per member, VAT field shown.' },
  { exportName: 'SignedOut', name: 'Signed out', group: 'Viewer', args: { viewer: 'anonymous' }, when: 'No user. Today: redirect to /onboarding and the destination is lost. New: the plan stays, sign-in replaces the frame, back to /plus after.' },
  { exportName: 'AlreadyPlus', name: 'Already Plus', group: 'Viewer', args: { viewer: 'plus' }, when: 'user.isPlus and personal. Manage subscription (hidden if the Plus was gifted), gift link.' },
  { exportName: 'AlreadyPlusGifted', name: 'Already Plus, as a gift', group: 'Viewer', args: { viewer: 'plus', giftedPlus: true }, when: 'Plus came from a gift (getPlusGifterUser): no Manage subscription, as production’s PlusPlus already does.' },
  { exportName: 'Unavailable', name: 'Region unavailable', group: 'Viewer', args: { viewer: 'unavailable' }, when: '!isValidRegion (invalidPlusRegions). Prices aren’t fetched there, so the price and cycle choice are hidden; the features stay.' },
  { exportName: 'Loading', name: 'Paddle loading', group: 'Payment state', args: { phase: 'loading' }, when: 'Before checkout.loaded. Our skeleton at the frame’s real height so nothing jumps.' },
  { exportName: 'Processing', name: 'Processing', group: 'Payment state', args: { phase: 'processing' }, when: 'After checkout.payment.initiated. Cycle buttons disabled until it resolves.' },
  { exportName: 'Declined', name: 'Card declined', group: 'Payment state', args: { phase: 'declined' }, when: 'checkout.payment.failed. Paddle shows the error in its frame; the plan half is untouched.' },
  { exportName: 'BankVerification', name: 'Bank verification (3-D Secure)', group: 'Payment state', args: { phase: 'authenticating' }, when: 'The card asks for 3-D Secure: the bank’s step happens inside Paddle (popup or in-frame). The page stays locked.' },
  { exportName: 'Blocked', name: 'Payment form blocked', group: 'Payment state', args: { phase: 'blocked' }, when: 'checkout.loaded never fires (~10s): usually an ad/privacy blocker stopping paddle.js. Ours: explain + Try again. Today: an empty box.' },
  { exportName: 'UsZip', name: 'US visitor (ZIP code)', group: 'Payment state', args: { country: 'US' }, when: 'Paddle asks for a postcode where the country uses one (US, CA…). Also: no reminder row, the US state is unknown.' },
  { exportName: 'PayPal', name: 'PayPal selected', group: 'Payment state', args: { method: 'paypal' }, when: 'Inside Paddle’s frame. PayPal opens its own window.' },
  { exportName: 'Safari', name: 'Safari (Apple Pay)', group: 'Payment state', args: { browser: 'safari' }, when: 'Paddle shows Apple Pay on Safari/iOS automatically; Google Pay on Chrome/Android.' },
  { exportName: 'Success', name: 'Success', group: 'After', args: { phase: 'success' }, when: 'checkout.completed → /plus/success. One next action: set the Briefing time.' },
  { exportName: 'GiftSuccess', name: 'Gift sent', group: 'After', args: { phase: 'success', purchase: 'gift', giftTo }, when: 'checkout.completed for a gift.' },
  { exportName: 'TeamSuccess', name: 'Team on Plus', group: 'After', args: { phase: 'success', purchase: 'team', seats: 3 }, when: 'Team purchase done: next action is inviting members (Settings › Organization).' },
  { exportName: 'IosSuccess', name: 'iOS purchase done', group: 'After', args: { phase: 'success', platform: 'ios' }, when: 'StoreKit purchase done: Apple sends the receipt; manage in Apple settings.' },
  { exportName: 'IosApp', name: 'iOS app (StoreKit)', group: 'Platform', args: { platform: 'ios' }, when: 'isIOSNative(). Same plan half; Apple’s sheet instead of Paddle. No gift, team or sale.' },
  { exportName: 'NoReminderRegion', name: 'Outside Paddle’s reminder regions', group: 'Region', args: { country: 'US' }, when: 'US without a known state, Israel, India, Brazil… Paddle sends no renewal reminder there, so the bill has no reminder row. (EU, UK and NY/CA etc. show it — every other case here is set to Germany.)' },
  { exportName: 'ReminderUsState', name: 'US state with a reminder (New York)', group: 'Region', args: { country: 'US-NY' }, when: 'Needs the US state; boot geo has only the country today, so this needs the API to add it. Until then US = no row.' },
  { exportName: 'Express', name: 'Phone, Paddle express', group: 'Open decision', args: { express: true }, when: 'Paddle’s express variant (wallets first). Needs Apple Pay domain verification. A later test, not this one.' },
];

/** Storybook's id for an export name: "FromAd" → "from-ad", "PhoneStep2" → "phone-step-2". */
export const caseId = (exportName: string): string =>
  `plus-checkout-3-use-cases--${exportName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([a-zA-Z])([0-9])/g, '$1-$2').toLowerCase()}`;
