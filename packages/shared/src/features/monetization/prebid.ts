/**
 * Kueez header bidding through Prebid.js, on the /read arbitrage template
 * only. There is no ad server: Prebid runs the auction and renders the
 * winning creative itself, and a slot with no bid falls through to the
 * AdSense unit it always had. The bundle in packages/webapp/public/prebid
 * ships exactly two modules, kueezRtbBidAdapter and consentManagementTcf.
 */

/**
 * Deploy-time switch, deliberately not a GrowthBook flag: the partner test is
 * all-or-nothing and its blast radius is one route, so a code change is the
 * cheapest audit trail for when Kueez demand was live. Off keeps the /read
 * template byte-for-byte on its current AdSense path.
 */
export const PREBID_ENABLED = false as boolean;

/** Served from packages/webapp/public; the arbitrage route is webapp-only. */
export const PREBID_SCRIPT_SRC = '/prebid/prebid.js';

export const KUEEZ_BIDDER = 'kueezrtb';

/** Display placement ids from the Kueez account manager. Banner only. */
export const KUEEZ_DISPLAY_PARAMS = {
  cId: '6a96e161de4584ddae0db1d8',
  pId: '65lk7c192882r0011813fn9',
} as const;

/** The exchange the adapter bids against and the user-sync host it pixels. */
export const PREBID_PRECONNECT_ORIGINS = [
  'https://exchange.kueezrtb.com',
  'https://sync.kueezrtb.com',
];

/** How long Prebid waits on the bidder before settling the auction. */
export const PREBID_AUCTION_TIMEOUT_MS = 1500;

/**
 * Upper bound on the whole request, auction included. Also the only thing
 * that settles a slot when prebid.js never arrives (blocked, or the network
 * dropped it): a queued `pbjs.que` callback simply never runs.
 */
export const PREBID_HARD_TIMEOUT_MS = 3000;

export type BannerSize = readonly [width: number, height: number];

export type PrebidBid = {
  adId: string;
  bidder: string;
  cpm: number;
  currency?: string;
  width: number;
  height: number;
};

export type PrebidNoBidReason = 'no_bid' | 'timeout' | 'error';

export type PrebidBidResult =
  | { bid: PrebidBid; reason?: undefined }
  | { bid: null; reason: PrebidNoBidReason };

type PrebidAdUnit = {
  code: string;
  mediaTypes: { banner: { sizes: BannerSize[] } };
  bids: { bidder: string; params: Record<string, unknown> }[];
};

type PrebidApi = {
  setConfig: (config: Record<string, unknown>) => void;
  addAdUnits: (units: PrebidAdUnit[]) => void;
  removeAdUnit: (code: string) => void;
  requestBids: (options: {
    adUnitCodes: string[];
    timeout: number;
    bidsBackHandler: () => void;
  }) => void;
  getHighestCpmBids: (code: string) => PrebidBid[];
  renderAd: (doc: Document, adId: string) => void;
};

/**
 * Before prebid.js executes only the command queue exists; the bundle drains
 * it on load and replaces `push` with immediate execution.
 */
type PrebidGlobal = Partial<PrebidApi> & { que: (() => void)[] };

declare global {
  interface Window {
    pbjs?: PrebidGlobal;
  }
}

export const getPbjs = (): PrebidGlobal => {
  window.pbjs = window.pbjs || { que: [] };
  window.pbjs.que = window.pbjs.que || [];
  return window.pbjs;
};

/**
 * The sizes a slot may ask for, given the width its box actually has: a
 * leaderboard format lists both 728x90 and 320x100, and only the one that
 * fits is a valid request. An unmeasured box (0) leaves every size in, since
 * nothing is known to rule any of them out.
 */
export const selectBannerSizes = (
  sizes: readonly BannerSize[],
  availableWidth: number,
): BannerSize[] =>
  sizes.filter(([width]) => availableWidth <= 0 || width <= availableWidth);

let isConfigured = false;

// setConfig is global, so it runs once per page. `cmpApi: 'iab'` reads the
// __tcfapi stub iubenda installs for GDPR-covered visitors; everyone else
// has no CMP, and `defaultGdprScope: false` lets their auction proceed.
// Kueez syncs users through an iframe, which Prebid blocks unless a bidder
// is explicitly allowed.
const configureOnce = (pbjs: PrebidApi): void => {
  if (isConfigured) {
    return;
  }
  isConfigured = true;
  pbjs.setConfig({
    consentManagement: {
      gdpr: { cmpApi: 'iab', timeout: 8000, defaultGdprScope: false },
    },
    userSync: {
      filterSettings: {
        iframe: { bidders: [KUEEZ_BIDDER], filter: 'include' },
      },
    },
  });
};

/**
 * Runs one auction for one placement and resolves with the highest bid or
 * the reason there is none. Never rejects: the caller's only decision is
 * whether to render the bid or fall back, so every failure is a `null` bid.
 */
export const requestPrebidBid = ({
  code,
  sizes,
}: {
  code: string;
  sizes: BannerSize[];
}): Promise<PrebidBidResult> =>
  new Promise((resolve) => {
    let isSettled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const settle = (result: PrebidBidResult): void => {
      if (isSettled) {
        return;
      }
      isSettled = true;
      clearTimeout(timer);
      resolve(result);
    };
    timer = setTimeout(
      () => settle({ bid: null, reason: 'timeout' }),
      PREBID_HARD_TIMEOUT_MS,
    );

    getPbjs().que.push(() => {
      // Inside the queue the bundle has loaded, so the full API exists.
      const pbjs = getPbjs() as PrebidApi;
      try {
        configureOnce(pbjs);
        pbjs.addAdUnits([
          {
            code,
            mediaTypes: { banner: { sizes } },
            bids: [{ bidder: KUEEZ_BIDDER, params: KUEEZ_DISPLAY_PARAMS }],
          },
        ]);
        pbjs.requestBids({
          adUnitCodes: [code],
          timeout: PREBID_AUCTION_TIMEOUT_MS,
          bidsBackHandler: () => {
            const [bid] = pbjs.getHighestCpmBids(code);
            // The bid stays renderable by adId after the unit is gone;
            // removing it keeps repeated placements from piling up units.
            pbjs.removeAdUnit(code);
            settle(bid ? { bid } : { bid: null, reason: 'no_bid' });
          },
        });
      } catch {
        settle({ bid: null, reason: 'error' });
      }
    });
  });

/**
 * Writes the winning creative into the slot's own iframe. Prebid fires the
 * win notice to Kueez from inside renderAd, so this is also the billable
 * event on their side.
 */
export const renderPrebidBid = (
  iframe: HTMLIFrameElement,
  bid: PrebidBid,
): void => {
  const doc = iframe.contentWindow?.document;
  if (!doc) {
    throw new Error('Prebid creative iframe has no document to render into');
  }
  iframe.setAttribute('width', String(bid.width));
  iframe.setAttribute('height', String(bid.height));
  getPbjs().que.push(() => {
    (getPbjs() as PrebidApi).renderAd(doc, bid.adId);
  });
};
