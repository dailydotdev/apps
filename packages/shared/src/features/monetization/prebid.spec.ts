import {
  KUEEZ_BIDDER,
  KUEEZ_DISPLAY_PARAMS,
  PREBID_HARD_TIMEOUT_MS,
  getPbjs,
  renderPrebidBid,
  requestPrebidBid,
  selectBannerSizes,
} from './prebid';
import type { PrebidBid } from './prebid';

type FakePbjs = {
  que: (() => void)[];
  setConfig: jest.Mock;
  addAdUnits: jest.Mock;
  removeAdUnit: jest.Mock;
  requestBids: jest.Mock;
  getHighestCpmBids: jest.Mock;
  renderAd: jest.Mock;
};

const bid: PrebidBid = {
  adId: 'ad-1',
  bidder: KUEEZ_BIDDER,
  cpm: 1.25,
  currency: 'USD',
  width: 300,
  height: 250,
};

/** A loaded bundle: the queue runs callbacks immediately, bids come back at once. */
const installLoadedPbjs = (bids: PrebidBid[]): FakePbjs => {
  const pbjs: FakePbjs = {
    que: { push: (callback: () => void) => callback() } as unknown as Array<
      () => void
    >,
    setConfig: jest.fn(),
    addAdUnits: jest.fn(),
    removeAdUnit: jest.fn(),
    requestBids: jest.fn(({ bidsBackHandler }) => bidsBackHandler()),
    getHighestCpmBids: jest.fn(() => bids),
    renderAd: jest.fn(),
  };
  window.pbjs = pbjs as unknown as Window['pbjs'];
  return pbjs;
};

afterEach(() => {
  delete window.pbjs;
  jest.useRealTimers();
});

describe('selectBannerSizes', () => {
  const leaderboard = [
    [728, 90],
    [320, 100],
  ] as const;

  it('keeps only the sizes that fit the box', () => {
    expect(selectBannerSizes(leaderboard, 320)).toEqual([[320, 100]]);
    expect(selectBannerSizes(leaderboard, 745)).toEqual([
      [728, 90],
      [320, 100],
    ]);
  });

  it('rules nothing out while the box is unmeasured', () => {
    expect(selectBannerSizes(leaderboard, 0)).toEqual(leaderboard);
  });
});

describe('requestPrebidBid', () => {
  it('declares the Kueez display unit and resolves the highest bid', async () => {
    const pbjs = installLoadedPbjs([bid]);

    const result = await requestPrebidBid({
      code: 'read:11:x',
      sizes: [[300, 250]],
    });

    expect(result).toEqual({ bid });
    expect(pbjs.addAdUnits).toHaveBeenCalledWith([
      {
        code: 'read:11:x',
        mediaTypes: { banner: { sizes: [[300, 250]] } },
        bids: [{ bidder: KUEEZ_BIDDER, params: KUEEZ_DISPLAY_PARAMS }],
      },
    ]);
    expect(pbjs.requestBids).toHaveBeenCalledWith(
      expect.objectContaining({ adUnitCodes: ['read:11:x'] }),
    );
    expect(pbjs.removeAdUnit).toHaveBeenCalledWith('read:11:x');
  });

  it('reports an empty auction as no bid', async () => {
    installLoadedPbjs([]);

    await expect(
      requestPrebidBid({ code: 'read:11:x', sizes: [[300, 250]] }),
    ).resolves.toEqual({ bid: null, reason: 'no_bid' });
  });

  it('times out when prebid.js never runs the queue', async () => {
    jest.useFakeTimers();

    const pending = requestPrebidBid({
      code: 'read:11:x',
      sizes: [[300, 250]],
    });
    jest.advanceTimersByTime(PREBID_HARD_TIMEOUT_MS);

    await expect(pending).resolves.toEqual({ bid: null, reason: 'timeout' });
    // The request is still queued for a bundle that never came.
    expect(getPbjs().que).toHaveLength(1);
  });

  it('turns a throwing bundle into no bid instead of rejecting', async () => {
    const pbjs = installLoadedPbjs([bid]);
    pbjs.addAdUnits.mockImplementation(() => {
      throw new Error('boom');
    });

    await expect(
      requestPrebidBid({ code: 'read:11:x', sizes: [[300, 250]] }),
    ).resolves.toEqual({ bid: null, reason: 'error' });
  });

  it('configures TCF consent and the Kueez iframe sync once per page', async () => {
    jest.isolateModules(() => {
      // Fresh module so the once-per-page latch starts unset.
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      const fresh = require('./prebid') as {
        requestPrebidBid: typeof requestPrebidBid;
      };
      const pbjs = installLoadedPbjs([bid]);

      return Promise.all([
        fresh.requestPrebidBid({ code: 'a', sizes: [[300, 250]] }),
        fresh.requestPrebidBid({ code: 'b', sizes: [[300, 250]] }),
      ]).then(() => {
        expect(pbjs.setConfig).toHaveBeenCalledTimes(1);
        expect(pbjs.setConfig).toHaveBeenCalledWith({
          consentManagement: {
            gdpr: { cmpApi: 'iab', timeout: 8000, defaultGdprScope: false },
          },
          userSync: {
            filterSettings: {
              iframe: { bidders: [KUEEZ_BIDDER], filter: 'include' },
            },
          },
        });
      });
    });
  });
});

describe('renderPrebidBid', () => {
  it('sizes the iframe to the creative and renders the bid into its document', () => {
    const pbjs = installLoadedPbjs([bid]);
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    renderPrebidBid(iframe, bid);

    expect(iframe.width).toBe('300');
    expect(iframe.height).toBe('250');
    expect(pbjs.renderAd).toHaveBeenCalledWith(
      iframe.contentWindow?.document,
      'ad-1',
    );
    iframe.remove();
  });
});
