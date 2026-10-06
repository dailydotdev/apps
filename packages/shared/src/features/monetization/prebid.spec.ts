/* eslint-disable no-underscore-dangle -- __tcfapi is the IAB-mandated global */
import type * as PrebidModule from './prebid';
import { PREBID_CMP_STUB_WAIT_MS } from './kueez';

type QueuedPbjs = { que: Array<() => void> };

let prebid: typeof PrebidModule;
let requestBids: jest.Mock;

/** The bundle arriving: Prebid installs its API and drains the queue. */
const executeBundle = (): void => {
  const pbjs = window.pbjs as unknown as QueuedPbjs;
  Object.assign(pbjs, {
    bidderSettings: {},
    setConfig: jest.fn(),
    requestBids,
    getHighestCpmBids: jest.fn(() => []),
  });
  while (pbjs.que.length) {
    pbjs.que.shift()?.();
  }
};

const installTcfStub = (): void => {
  window.__tcfapi = jest.fn() as unknown as Window['__tcfapi'];
};

/** Settles the microtask hops between the queue and `requestBids`. */
const flush = async (): Promise<void> => {
  for (let i = 0; i < 5; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
};

const track = (
  promise: Promise<PrebidModule.AuctionResult>,
): { readonly result: PrebidModule.AuctionResult | undefined } => {
  let result: PrebidModule.AuctionResult | undefined;
  promise.then((value) => {
    result = value;
  });
  return {
    get result() {
      return result;
    },
  };
};

beforeEach(() => {
  jest.useFakeTimers();
  // Module state (configured once, CMP expectation) must not leak between
  // tests, and the pbjs global is the bundle's, so both start over.
  jest.resetModules();
  delete window.pbjs;
  delete window.__tcfapi;
  requestBids = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  prebid = require('./prebid');
});

afterEach(() => {
  jest.useRealTimers();
});

describe('requestKueezBid', () => {
  it('runs the auction as soon as the bundle executes when no CMP is expected', async () => {
    prebid.configurePrebid({ withConsentManagement: false });
    const auction = track(
      prebid.requestKueezBid({ code: 'slot-1', sizes: [[300, 250]] }),
    );

    executeBundle();
    await flush();

    expect(requestBids).toHaveBeenCalledTimes(1);
    requestBids.mock.calls[0][0].bidsBackHandler();
    await flush();
    expect(auction.result).toEqual({ status: 'no_bid' });
  });

  it('holds a consent-managed auction until the TCF stub exists', async () => {
    prebid.configurePrebid({ withConsentManagement: true });
    prebid.requestKueezBid({ code: 'slot-1', sizes: [[300, 250]] });

    // The bundle beats the stub: Prebid would look the CMP up now, find
    // nothing and cancel.
    executeBundle();
    await flush();
    jest.advanceTimersByTime(300);
    await flush();
    expect(requestBids).not.toHaveBeenCalled();

    installTcfStub();
    jest.advanceTimersByTime(50);
    await flush();
    expect(requestBids).toHaveBeenCalledTimes(1);
  });

  it('runs a consent-managed auction anyway once the stub wait cap passes', async () => {
    prebid.configurePrebid({ withConsentManagement: true });
    prebid.requestKueezBid({ code: 'slot-1', sizes: [[300, 250]] });
    executeBundle();
    await flush();

    jest.advanceTimersByTime(PREBID_CMP_STUB_WAIT_MS + 50);
    await flush();

    expect(requestBids).toHaveBeenCalledTimes(1);
  });

  it('gives up on a bundle that never executes', async () => {
    prebid.configurePrebid({ withConsentManagement: false });
    const auction = track(
      prebid.requestKueezBid({ code: 'slot-1', sizes: [[300, 250]] }),
    );

    jest.advanceTimersByTime(5_000);
    await flush();

    expect(auction.result).toEqual({ status: 'unavailable' });
  });

  it('leaves the clock to Prebid once the auction is in flight', async () => {
    prebid.configurePrebid({ withConsentManagement: false });
    const auction = track(
      prebid.requestKueezBid({ code: 'slot-1', sizes: [[300, 250]] }),
    );
    executeBundle();
    await flush();

    // Longer than any abandon window: a CMP wait plus a slow auction must not
    // be mistaken for a missing bundle.
    jest.advanceTimersByTime(15_000);
    await flush();
    expect(auction.result).toBeUndefined();

    requestBids.mock.calls[0][0].bidsBackHandler();
    await flush();
    expect(auction.result).toEqual({ status: 'no_bid' });
  });
});
