/**
 * The thin layer between our slots and the bundled Prebid.js. Everything that
 * knows the pbjs global lives here, so `ProgrammaticAd` only ever deals in
 * "ask for a bid" and "render this bid".
 *
 * There is no ad server underneath. With a single bidder and no Ad Manager,
 * Prebid runs the auction and we render the winner ourselves, which is the
 * documented "Prebid without an ad server" setup. The practical consequences
 * are that no targeting keys are needed anywhere, and that rendering is our
 * job rather than a tag's.
 */
import type { AdSize, AdUtm } from './kueez';
import {
  KUEEZ_BIDDER_CODE,
  KUEEZ_CID,
  KUEEZ_PID,
  PREBID_AUCTION_TIMEOUT_MS,
  PREBID_CMP_TIMEOUT_MS,
} from './kueez';

export type PrebidBid = {
  /** Prebid's handle on the creative, and the only thing `renderAd` needs. */
  adId: string;
  bidder: string;
  cpm: number;
  currency?: string;
  width: number;
  height: number;
  creativeId?: string;
  /**
   * Kueez's viewability pixel, present on bids that want one. Prebid only
   * fires it through its `bidViewability` module, which this bundle does not
   * carry, so `pingViewable` fires it from our own MRC measurement instead.
   */
  viewableUrl?: string;
  meta?: { advertiserDomains?: string[] };
};

type RequestBidsOptions = {
  timeout: number;
  adUnits: Array<Record<string, unknown>>;
  bidsBackHandler: () => void;
};

type Pbjs = {
  /** Commands queued here run once the bundle has executed, never before. */
  que: Array<() => void>;
  /** Per-bidder permissions, assigned rather than passed to `setConfig`. */
  bidderSettings: Record<string, { storageAllowed?: boolean }>;
  setConfig: (config: Record<string, unknown>) => void;
  requestBids: (options: RequestBidsOptions) => void;
  getHighestCpmBids: (adUnitCode: string) => PrebidBid[];
  renderAd: (doc: Document, adId: string) => void;
};

declare global {
  interface Window {
    pbjs?: Pbjs;
  }
}

/**
 * The command queue, created before the bundle arrives. Prebid's own loader
 * expects exactly this shape and drains the queue on execution, so callers
 * can request bids during hydration without racing the script tag.
 */
const getPbjs = (): Pbjs => {
  window.pbjs = window.pbjs ?? ({ que: [] } as unknown as Pbjs);
  window.pbjs.que = window.pbjs.que ?? [];
  return window.pbjs;
};

let isConfigured = false;

export type PrebidConfigOptions = {
  /**
   * Whether to wait on the IAB CMP before bidding. Scoped exactly like the
   * TCF stub itself, which only loads for GDPR-covered visitors: configuring
   * `consentManagement` for everyone would have every other visitor's auction
   * wait out the CMP timeout for an API that is never going to appear.
   */
  withConsentManagement: boolean;
  utm?: AdUtm;
};

/**
 * One-time auction config. Idempotent because slots configure lazily: every
 * slot calls this before its first auction and the first call wins.
 */
export const configurePrebid = ({
  withConsentManagement,
  utm,
}: PrebidConfigOptions): void => {
  if (isConfigured) {
    return;
  }
  isConfigured = true;

  const pbjs = getPbjs();
  pbjs.que.push(() => {
    // Prebid denies bidders device access unless the publisher grants it, and
    // silently: the auction still runs, the adapter just cannot keep the
    // first-party id it matches users on, so every request looks like a new
    // visitor and prices like one. Under the TCF module this stays subject to
    // the visitor's purpose 1 consent.
    pbjs.bidderSettings = {
      [KUEEZ_BIDDER_CODE]: { storageAllowed: true },
    };

    pbjs.setConfig({
      bidderTimeout: PREBID_AUCTION_TIMEOUT_MS,
      // Targeting keys exist for an ad server to key line items off. Nothing
      // consumes them here, and building them for every bidder is work on the
      // critical path of a render we do ourselves.
      enableSendAllBids: false,
      // Prebid blocks iframe syncs by default. Kueez's adapter registers an
      // iframe sync, which is what lets the exchange match a user to its
      // demand partners: without it their bids come back for an unknown user
      // and price accordingly.
      userSync: {
        filterSettings: {
          iframe: { bidders: [KUEEZ_BIDDER_CODE], filter: 'include' },
        },
      },
      // First-party data the adapter forwards to the exchange verbatim.
      // Acquisition source is the strongest signal we have about what a
      // visitor is worth, and it is page-level rather than per-slot.
      ...(utm && {
        ortb2: { site: { ext: { data: { ...utm } } } },
      }),
      ...(withConsentManagement && {
        consentManagement: {
          gdpr: {
            cmpApi: 'iab',
            timeout: PREBID_CMP_TIMEOUT_MS,
            // The CMP decides scope. Defaulting to in-scope would apply GDPR
            // restrictions to visitors iubenda has already placed outside it.
            defaultGdprScope: false,
          },
        },
      }),
    });
  });
};

export type AuctionResult =
  | { status: 'bid'; bid: PrebidBid }
  | { status: 'no_bid' }
  /** The bundle never executed, so the queued auction never ran: ad blocker. */
  | { status: 'unavailable' };

/**
 * Grace on top of the auction timeout before a slot gives up entirely. Prebid
 * calls back at `bidderTimeout` on its own; this only catches the case where
 * the bundle is missing and the queued command never runs at all, which an
 * ad blocker makes the common case rather than the rare one.
 */
const AUCTION_ABANDON_MS = PREBID_AUCTION_TIMEOUT_MS + 2_000;

export type BidRequestOptions = {
  /** Unique per mounted slot: it is how the winning bid is looked up again. */
  code: string;
  sizes: AdSize[];
};

/**
 * Runs one auction for one slot. Deliberately not batched across slots: the
 * Kueez adapter builds a separate request per ad unit regardless (its
 * `singleRequest` support is limited to sibling adapters), so batching would
 * buy nothing while forcing slots to wait for each other and giving up the
 * per-slot laziness that viewability depends on.
 */
export const requestKueezBid = ({
  code,
  sizes,
}: BidRequestOptions): Promise<AuctionResult> =>
  new Promise((resolve) => {
    let isSettled = false;
    const settle = (result: AuctionResult): void => {
      if (isSettled) {
        return;
      }
      isSettled = true;
      resolve(result);
    };

    const abandon = globalThis.setTimeout(
      () => settle({ status: 'unavailable' }),
      AUCTION_ABANDON_MS,
    );

    const pbjs = getPbjs();
    pbjs.que.push(() => {
      pbjs.requestBids({
        timeout: PREBID_AUCTION_TIMEOUT_MS,
        adUnits: [
          {
            code,
            mediaTypes: { banner: { sizes } },
            bids: [
              {
                bidder: KUEEZ_BIDDER_CODE,
                params: { cId: KUEEZ_CID, pId: KUEEZ_PID },
              },
            ],
          },
        ],
        bidsBackHandler: () => {
          globalThis.clearTimeout(abandon);
          const [bid] = pbjs.getHighestCpmBids(code) ?? [];
          settle(bid ? { status: 'bid', bid } : { status: 'no_bid' });
        },
      });
    });
  });

/**
 * Renders a winning creative into its own iframe inside `container`.
 *
 * Prebid refuses to write into the main document, so the iframe is required
 * rather than stylistic. It is same-origin, which is what `renderAd` needs to
 * reach the document it writes into, and therefore how creatives execute:
 * unlike AdSense, whose creatives ran inside Google's cross-origin frames,
 * a Kueez creative runs with access to this origin. That is the standard
 * trade of running Prebid without an ad server, and the reason the demand
 * comes from one contracted partner rather than an open pool.
 */
export const renderPrebidBid = (
  container: HTMLElement,
  bid: PrebidBid,
): boolean => {
  const { pbjs } = window;
  if (typeof pbjs?.renderAd !== 'function') {
    return false;
  }

  const iframe = document.createElement('iframe');
  iframe.title = 'Advertisement';
  iframe.width = `${bid.width}`;
  iframe.height = `${bid.height}`;
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('marginwidth', '0');
  iframe.setAttribute('marginheight', '0');
  iframe.style.border = '0';
  iframe.style.display = 'block';
  iframe.style.margin = '0 auto';
  container.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    return false;
  }

  try {
    // Also what tells Prebid the bid won, which fires the adapter's billing
    // notice to the exchange. Skipping it would serve the creative for free
    // and leave their reporting disagreeing with ours.
    pbjs.renderAd(doc, bid.adId);
    return true;
  } catch {
    iframe.remove();
    return false;
  }
};

/**
 * Fires the bid's viewability pixel. Prebid's `bidViewability` module would
 * normally own this, but it is not in the bundle and we already measure
 * viewability to the MRC definition for our own events (`useViewability`), so
 * the ping rides that measurement instead of a second observer.
 */
export const pingViewable = (bid: PrebidBid): void => {
  if (!bid.viewableUrl) {
    return;
  }

  // An image request rather than sendBeacon: the pixel is a GET, and a beacon
  // would deliver it as a POST, which measurement endpoints do not count.
  const pixel = new Image();
  pixel.src = bid.viewableUrl;
};
