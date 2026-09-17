/**
 * Kueez is the programmatic demand behind every display slot, replacing
 * AdSense. Their inventory does not arrive through a tag of their own: it is
 * Prebid demand, so the page runs a client-side auction with exactly one
 * bidder and renders the winning creative itself. The bundle in
 * `packages/webapp/public/prebid/prebid.js` is built with only
 * `kueezRtbBidAdapter` and `consentManagementTcf` for that reason.
 *
 * The two ids below are the adapter's required params, sent on every bid
 * request. They are per publisher rather than per placement: Kueez issued one
 * pair covering all of our display inventory, so nothing here varies by slot,
 * and per-placement reporting comes from our own events instead (see
 * `getAdSlotLogExtra`, which carries the slot number and the winning cpm).
 */
export const KUEEZ_CID = '6a96e161de4584ddae0db1d8';
export const KUEEZ_PID = '65lk7c192882r0011813fn9';

/**
 * The bidder code the bundled adapter registers itself under, and the value
 * Prebid returns on every bid. Not "kueez": the adapter is
 * `kueezRtbBidAdapter` and registers as `kueezrtb`, so anything matching on
 * `bid.bidder` has to use this exact string.
 */
export const KUEEZ_BIDDER_CODE = 'kueezrtb';

/**
 * Served from our own origin rather than a CDN copy, which is what
 * `public/prebid/` exists for. Upgrading Prebid means rebuilding the bundle
 * from prebid.org with the same two modules and replacing that file.
 *
 * A root-relative path, so this only resolves on the webapp. That is also the
 * only surface with programmatic slots: the extension serves internal ads
 * only, and native wraps the webapp shell.
 */
export const PREBID_SCRIPT_SRC = '/prebid/prebid.js';

/**
 * The origins the first auction touches: the exchange the bid request goes
 * to, and the user-sync host the adapter pixels once bids come back.
 * Preconnecting from <Head> runs DNS/TLS setup during hydration instead of
 * serially after the bundle executes.
 */
export const KUEEZ_PRECONNECT_ORIGINS = [
  'https://exchange.kueezrtb.com',
  'https://sync.kueezrtb.com',
];

/**
 * How long an auction may take before the slot is treated as unfilled. The
 * exchange round trip measured from outside Europe is 1-1.5s, so the usual
 * one-second single-bidder setting timed out the very requests it was meant
 * to bound. Slots request a viewport ahead of the reader, which is what buys
 * the auction this long without the box scrolling into view empty.
 */
export const PREBID_AUCTION_TIMEOUT_MS = 5_000;

/**
 * How long a consent-managed auction waits for the CMP's TCF stub to exist
 * before running anyway. Prebid looks the CMP up synchronously when the
 * auction starts and treats "not found" as fatal, unlike a CMP that is slow
 * to answer, and the same-origin, preloaded bundle beats iubenda's CDN stub
 * to execution on most loads. Past this the stub is not coming (blocked CDN)
 * and Prebid's own cancel is the right outcome for a GDPR-covered visitor.
 */
export const PREBID_CMP_STUB_WAIT_MS = 2_000;

/**
 * How long Prebid waits for the CMP to deliver a terminal answer before
 * giving up on consent data. Only ever applied for GDPR-covered visitors,
 * who are the only ones the TCF stub loads for (see `Iubenda.tsx`).
 */
export const PREBID_CMP_TIMEOUT_MS = 3_000;

/** A creative size the exchange may answer a slot with, as [width, height]. */
export type AdSize = [number, number];

export type AdSlotConfig = {
  /**
   * Pins the slot to exactly these sizes instead of the ones its format
   * allows. Only for placements booked at a fixed size (the pinned phone
   * banner, the sticky rail tower), where a taller creative would cover the
   * page rather than sit in it.
   */
  sizes?: AdSize[];
};

export type AdSlots = Record<string, AdSlotConfig>;

/**
 * Whether a surface has anything to serve. With one publisher-wide id pair
 * there is no per-slot unit that can be missing, so presence in the map is
 * the whole answer: a surface that should stay dark ships an empty map.
 */
export const hasLiveAdSlots = (slots: AdSlots): boolean =>
  Object.keys(slots).length > 0;

/**
 * UTM dimensions worth attributing an ad impression to. The values ride our
 * own events and Prebid's `ortb2` first-party data, so Kueez can price the
 * traffic it is actually bidding on: a visitor from a paid campaign is worth
 * a different amount to them than an organic one.
 */
export const AD_UTM_KEYS = ['source', 'medium', 'campaign', 'content'] as const;

export type AdUtmKey = (typeof AD_UTM_KEYS)[number];

export type AdUtm = Partial<Record<AdUtmKey, string>>;
