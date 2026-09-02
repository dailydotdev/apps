import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { ProgrammaticAd, ProgrammaticAdFormat } from './ProgrammaticAd';
import { getLogContextStatic } from '../../contexts/LogContext';
import type { LogContextData } from '../../hooks/log/useLogContextData';
import { LogEvent } from '../../lib/log';
import { AdActions } from '../../lib/ads';
import type { PrebidBid } from './prebid';
import { KUEEZ_BIDDER, PREBID_HARD_TIMEOUT_MS } from './prebid';

// The switch ships off; this suite covers the path it turns on.
jest.mock('./prebid', () => ({
  ...(jest.requireActual('./prebid') as Record<string, unknown>),
  PREBID_ENABLED: true,
}));

const LogContext = getLogContextStatic();
const logEvent = jest.fn();

const config = { id: '2222222222', type: 'display' } as const;

const bid: PrebidBid = {
  adId: 'ad-1',
  bidder: KUEEZ_BIDDER,
  cpm: 1.25,
  width: 728,
  height: 90,
};

type FakePbjs = {
  requestBids: jest.Mock;
  addAdUnits: jest.Mock;
  renderAd: jest.Mock;
};

const installLoadedPbjs = (bids: PrebidBid[]): FakePbjs => {
  const pbjs = {
    que: { push: (callback: () => void) => callback() },
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

const renderAd = (
  props: Partial<React.ComponentProps<typeof ProgrammaticAd>> = {},
) =>
  render(
    <LogContext.Provider value={{ logEvent } as unknown as LogContextData}>
      <ProgrammaticAd
        slot={2}
        config={config}
        format={ProgrammaticAdFormat.Leaderboard}
        surface="read"
        headerBidding
        eager
        {...props}
      />
    </LogContext.Provider>,
  );

const loggedEvents = (): string[] =>
  logEvent.mock.calls.map(([event]) => event.event_name);

const eventsNamed = (name: string) =>
  logEvent.mock.calls
    .filter(([event]) => event.event_name === name)
    .map(([event]) => event);

beforeEach(() => {
  logEvent.mockClear();
  window.adsbygoogle = [];
});

afterEach(() => {
  delete window.pbjs;
  jest.useRealTimers();
});

describe('ProgrammaticAd header bidding', () => {
  it('renders the winning bid in its own iframe and never asks AdSense', async () => {
    const pbjs = installLoadedPbjs([bid]);
    renderAd();

    const iframe = (await screen.findByTestId(
      'prebid-slot-2',
    )) as HTMLIFrameElement;
    await waitFor(() => expect(pbjs.renderAd).toHaveBeenCalled());

    expect(pbjs.renderAd).toHaveBeenCalledWith(
      iframe.contentWindow?.document,
      'ad-1',
    );
    expect(iframe.width).toBe('728');
    expect(screen.queryByTestId('adsense-slot-2')).not.toBeInTheDocument();
    expect(window.adsbygoogle).toHaveLength(0);
    expect(loggedEvents()).toEqual(
      expect.arrayContaining([
        LogEvent.RequestPrebidBid,
        LogEvent.FillPrebidBid,
        AdActions.Impression,
      ]),
    );
    expect(loggedEvents()).not.toContain(LogEvent.RequestAdsenseSlot);
    expect(eventsNamed(AdActions.Impression)[0]).toMatchObject({
      target_type: 'ad',
      target_id: 'read:2',
      ad_provider_id: KUEEZ_BIDDER,
    });
    expect(
      JSON.parse(eventsNamed(LogEvent.FillPrebidBid)[0].extra),
    ).toMatchObject({
      slot: 2,
      surface: 'read',
      bidder: KUEEZ_BIDDER,
      cpm: 1.25,
      size: '728x90',
    });
  });

  it('falls back to the AdSense unit when Kueez has no bid', async () => {
    installLoadedPbjs([]);
    renderAd();

    await screen.findByTestId('adsense-slot-2');

    expect(window.adsbygoogle).toHaveLength(1);
    expect(screen.queryByTestId('prebid-slot-2')).not.toBeInTheDocument();
    expect(
      JSON.parse(eventsNamed(LogEvent.EmptyPrebidBid)[0].extra),
    ).toMatchObject({ reason: 'no_bid' });
    expect(loggedEvents()).toContain(LogEvent.RequestAdsenseSlot);
  });

  it('falls back to AdSense when prebid.js never loads', async () => {
    jest.useFakeTimers();
    renderAd();

    expect(screen.queryByTestId('adsense-slot-2')).not.toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(PREBID_HARD_TIMEOUT_MS);
    });

    expect(screen.getByTestId('adsense-slot-2')).toBeInTheDocument();
    expect(
      JSON.parse(eventsNamed(LogEvent.EmptyPrebidBid)[0].extra),
    ).toMatchObject({ reason: 'timeout' });
  });

  it('requests only the sizes that fit the slot', async () => {
    const pbjs = installLoadedPbjs([]);
    const clientWidth = jest
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockReturnValue(320);
    renderAd();

    await screen.findByTestId('adsense-slot-2');

    expect(pbjs.addAdUnits).toHaveBeenCalledWith([
      expect.objectContaining({
        mediaTypes: { banner: { sizes: [[320, 100]] } },
      }),
    ]);
    clientWidth.mockRestore();
  });

  it('leaves slots that did not opt in on AdSense', () => {
    const pbjs = installLoadedPbjs([bid]);
    renderAd({ headerBidding: false, surface: 'organic' });

    expect(screen.getByTestId('adsense-slot-2')).toBeInTheDocument();
    expect(pbjs.requestBids).not.toHaveBeenCalled();
  });

  it('skips the auction for formats Prebid cannot bid on', () => {
    const pbjs = installLoadedPbjs([bid]);
    renderAd({ format: ProgrammaticAdFormat.Native });

    expect(screen.getByTestId('adsense-slot-2')).toBeInTheDocument();
    expect(pbjs.requestBids).not.toHaveBeenCalled();
  });
});
