import React from 'react';
import {
  act,
  fireEvent,
  render as rtlRender,
  screen,
} from '@testing-library/react';
import { ReadAdFormat, ReadAdSlot } from './ReadAdSlot';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import { getLogContextStatic } from '../../../contexts/LogContext';
import type { LogContextData } from '../../../hooks/log/useLogContextData';
import { LogEvent } from '../../../lib/log';
import { AdActions } from '../../../lib/ads';
import type { AdSlots } from '../../../features/monetization/kueez';
import type {
  AuctionResult,
  PrebidBid,
} from '../../../features/monetization/prebid';
import {
  configurePrebid,
  renderPrebidBid,
  requestKueezBid,
} from '../../../features/monetization/prebid';
import { featureReadAds } from '../../../lib/featureManagement';
import { useFeature } from '../../GrowthBookProvider';
import { ORGANIC_SLOT } from './slots';

jest.mock('../../GrowthBookProvider', () => ({
  ...(jest.requireActual('../../GrowthBookProvider') as Record<
    string,
    unknown
  >),
  useFeature: jest.fn(),
}));

jest.mock('../../../lib/constants', () => ({
  ...(jest.requireActual('../../../lib/constants') as Record<string, unknown>),
  isDevelopment: false,
}));

// jsdom has no Prebid bundle, so the auction itself is the seam: every test
// decides what the exchange answered rather than what the DOM looked like.
jest.mock('../../../features/monetization/prebid', () => ({
  configurePrebid: jest.fn(),
  requestKueezBid: jest.fn(),
  renderPrebidBid: jest.fn(),
  pingViewable: jest.fn(),
}));

// The slot maps ship hardcoded; tests swap in fixtures via these mutable
// module objects rather than asserting against the production map.
jest.mock('./slots', () => ({
  ...(jest.requireActual('./slots') as Record<string, unknown>),
  READ_AD_SLOTS: {},
  ORGANIC_AD_SLOTS: {},
}));

const mockConstants = jest.requireMock('../../../lib/constants') as {
  isDevelopment: boolean;
};
const mockSlotMaps = jest.requireMock('./slots') as {
  READ_AD_SLOTS: AdSlots;
  ORGANIC_AD_SLOTS: AdSlots;
};

const mockUseFeature = jest.mocked(useFeature);
const mockRequestBid = jest.mocked(requestKueezBid);
const mockConfigurePrebid = jest.mocked(configurePrebid);
const mockRenderBid = jest.mocked(renderPrebidBid);

const flags = { read: true };

const BID: PrebidBid = {
  adId: 'ad-1',
  bidder: 'kueezrtb',
  cpm: 2.5,
  currency: 'USD',
  width: 300,
  height: 250,
  creativeId: 'creative-1',
};

const answerWith = (result: AuctionResult): void => {
  mockRequestBid.mockResolvedValue(result);
};

/**
 * The default: an auction still out. Tests that care about the outcome say so
 * with `answerWith`, and the rest never settle, so nothing resolves into a
 * component after its test has finished.
 */
const leaveAuctionPending = (): void => {
  mockRequestBid.mockReturnValue(new Promise<AuctionResult>(() => {}));
};

/** Lets the auction promise resolve and its state updates flush. */
const settleAuction = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve();
  });
};

// Both surfaces are anonymous-only and wait for boot, so the default render
// is an anonymous visitor with auth resolved.
const anonymousAuth = { isAuthReady: true } as unknown as AuthContextData;
const render = (
  ui: React.ReactElement,
  options?: Parameters<typeof rtlRender>[1],
): ReturnType<typeof rtlRender> =>
  rtlRender(
    <AuthContext.Provider value={anonymousAuth}>{ui}</AuthContext.Provider>,
    options,
  );

// Nested inside the anonymous default; the closest provider wins.
const renderLoggedIn = (ui: React.ReactElement) =>
  render(
    <AuthContext.Provider
      value={
        { isAuthReady: true, user: { id: 'u1' } } as unknown as AuthContextData
      }
    >
      {ui}
    </AuthContext.Provider>,
  );

/** Fills the /read map: the surface has no flag beyond the kill switch. */
const setSlots = (slots: AdSlots): void => {
  mockSlotMaps.READ_AD_SLOTS = slots;
};

const setOrganicSlots = (slots: AdSlots): void => {
  mockSlotMaps.ORGANIC_AD_SLOTS = slots;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockConstants.isDevelopment = false;
  flags.read = true;
  mockSlotMaps.READ_AD_SLOTS = {};
  mockSlotMaps.ORGANIC_AD_SLOTS = {};
  leaveAuctionPending();
  mockRenderBid.mockImplementation((container: HTMLElement) => {
    container.appendChild(document.createElement('iframe'));
    return true;
  });
  mockUseFeature.mockImplementation((feature) =>
    feature === featureReadAds ? flags.read : feature.defaultValue,
  );
});

describe('ReadAdSlot', () => {
  it('renders nothing while the slot map is empty', () => {
    setSlots({});
    const { container } = render(
      <ReadAdSlot slot={3} format={ReadAdFormat.Rectangle} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the density-review placeholder only in development', () => {
    mockConstants.isDevelopment = true;
    setSlots({});
    render(<ReadAdSlot slot={3} format={ReadAdFormat.Rectangle} />);

    expect(screen.getByTestId('read-ad-slot-3')).toBeInTheDocument();
    expect(mockRequestBid).not.toHaveBeenCalled();
  });

  it('drops phone-hidden slots below the tablet breakpoint', () => {
    setSlots({ '5': {} });
    render(
      <ReadAdSlot slot={5} format={ReadAdFormat.Rectangle} hideOnPhone eager />,
    );

    expect(screen.getByTestId('ad-slot-5').parentElement).toHaveClass(
      'hidden',
      'tablet:block',
    );
  });

  it('offers a format its whole size range when nothing is booked', () => {
    setSlots({ '3': {} });
    render(<ReadAdSlot slot={3} format={ReadAdFormat.Rectangle} eager />);

    // An unlaid-out slot (jsdom has no layout) can still only be answered
    // with a size that fits it, which is the narrowest one the format lists.
    expect(mockRequestBid).toHaveBeenCalledWith(
      expect.objectContaining({ sizes: [[300, 250]] }),
    );
  });

  it('asks for exactly the booked size on a fixed slot', () => {
    setOrganicSlots({
      [ORGANIC_SLOT.topLeaderboardPhone]: { sizes: [[320, 50]] },
    });
    render(
      <ReadAdSlot
        surface="organic"
        slot={ORGANIC_SLOT.topLeaderboardPhone}
        format={ReadAdFormat.MobileBanner}
        eager
      />,
    );

    expect(mockRequestBid).toHaveBeenCalledWith(
      expect.objectContaining({ sizes: [[320, 50]] }),
    );
  });

  it('gives every mounted slot its own ad unit code', () => {
    // The code is how a winning bid is found again, so two placements sharing
    // a slot number must not share one.
    setSlots({ '17': {} });
    render(
      <>
        <ReadAdSlot slot={17} format={ReadAdFormat.MediumRectangle} eager />
        <ReadAdSlot slot={17} format={ReadAdFormat.MediumRectangle} eager />
      </>,
    );

    const [first, second] = mockRequestBid.mock.calls.map(
      ([args]) => args.code,
    );
    expect(first).not.toEqual(second);
  });

  it('runs no auction before the slot becomes eligible', () => {
    // The suite-wide IntersectionObserver mock never fires, which models a
    // slot that has never come near the viewport.
    setSlots({ '3': {} });
    render(<ReadAdSlot slot={3} format={ReadAdFormat.Rectangle} />);

    expect(mockRequestBid).not.toHaveBeenCalled();
  });

  it('runs eager auctions on mount without waiting for intersection', () => {
    setSlots({ '2': {} });
    render(<ReadAdSlot slot={2} format={ReadAdFormat.Leaderboard} eager />);

    expect(mockRequestBid).toHaveBeenCalledTimes(1);
  });

  it('collapses the reservation when no bid comes back', async () => {
    answerWith({ status: 'no_bid' });
    setSlots({ '2': {} });
    render(<ReadAdSlot slot={2} format={ReadAdFormat.Leaderboard} eager />);
    await settleAuction();

    expect(screen.getByTestId('ad-slot-2').parentElement).toHaveClass(
      '!hidden',
    );
  });

  it('keeps the reservation standing while the auction is still out', () => {
    // Hiding early is unrecoverable in the reader's eyes: the box would jump
    // back in under them when a slow bid lands.
    setSlots({ '2': {} });
    render(<ReadAdSlot slot={2} format={ReadAdFormat.Leaderboard} eager />);

    expect(screen.getByTestId('ad-slot-2').parentElement).not.toHaveClass(
      '!hidden',
    );
  });

  it('never renders for logged-in users', () => {
    setSlots({ '3': {} });
    const { container } = renderLoggedIn(
      <ReadAdSlot slot={3} format={ReadAdFormat.Rectangle} eager />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('stays dark until auth resolves, so a logged-in boot never sees a flash', () => {
    setSlots({ '3': {} });
    const { container } = rtlRender(
      <AuthContext.Provider
        value={{ isAuthReady: false } as unknown as AuthContextData}
      >
        <ReadAdSlot slot={3} format={ReadAdFormat.Rectangle} eager />
      </AuthContext.Provider>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('goes dark when the read_ads kill switch is off', () => {
    flags.read = false;
    setSlots({ '3': {} });
    const { container } = render(
      <ReadAdSlot slot={3} format={ReadAdFormat.Rectangle} eager />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('collapses slot numbers the surface does not carry', () => {
    setSlots({ '3': {} });
    const { container } = render(
      <ReadAdSlot slot={4} format={ReadAdFormat.MediumRectangle} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('waits on the CMP only where the TCF stub loads', () => {
    setSlots({ '2': {} });
    const renderFrom = (region: string) =>
      rtlRender(
        <AuthContext.Provider
          value={
            { isAuthReady: true, geo: { region } } as unknown as AuthContextData
          }
        >
          <ReadAdSlot slot={2} format={ReadAdFormat.Leaderboard} eager />
        </AuthContext.Provider>,
      );

    // Prebid cancels every auction where it expects a CMP and finds none, so
    // the scope has to match Iubenda.tsx's, not the wider isGdprCovered.
    renderFrom('IN');
    expect(mockConfigurePrebid).toHaveBeenLastCalledWith(
      expect.objectContaining({ withConsentManagement: false }),
    );

    renderFrom('GB');
    expect(mockConfigurePrebid).toHaveBeenLastCalledWith(
      expect.objectContaining({ withConsentManagement: true }),
    );
  });
});

describe('ReadAdSlot on the organic surface', () => {
  const organicFixture: AdSlots = {
    [ORGANIC_SLOT.topLeaderboard]: {},
  };

  it('renders for an anonymous visitor when the slot is configured', () => {
    setOrganicSlots(organicFixture);
    render(
      <ReadAdSlot
        surface="organic"
        slot={ORGANIC_SLOT.topLeaderboard}
        format={ReadAdFormat.Leaderboard}
        eager
      />,
    );

    expect(
      screen.getByTestId(`ad-slot-${ORGANIC_SLOT.topLeaderboard}`),
    ).toBeInTheDocument();
  });

  it('never renders for logged-in users', () => {
    setOrganicSlots(organicFixture);
    const { container } = renderLoggedIn(
      <ReadAdSlot
        surface="organic"
        slot={ORGANIC_SLOT.topLeaderboard}
        format={ReadAdFormat.Leaderboard}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('ignores the read flag and map entirely', () => {
    setSlots({ [ORGANIC_SLOT.topLeaderboard]: {} });
    const { container } = render(
      <ReadAdSlot
        surface="organic"
        slot={ORGANIC_SLOT.topLeaderboard}
        format={ReadAdFormat.Leaderboard}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows no development placeholder outside the read template', () => {
    mockConstants.isDevelopment = true;
    setOrganicSlots({});
    const { container } = render(
      <ReadAdSlot
        surface="organic"
        slot={ORGANIC_SLOT.topLeaderboard}
        format={ReadAdFormat.Leaderboard}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});

describe('ProgrammaticAd telemetry', () => {
  const LogContext = getLogContextStatic();
  const logEvent = jest.fn();

  const renderWithLog = (ui: React.ReactElement) =>
    rtlRender(
      <LogContext.Provider value={{ logEvent } as unknown as LogContextData}>
        <AuthContext.Provider
          value={{ isAuthReady: true } as unknown as AuthContextData}
        >
          {ui}
        </AuthContext.Provider>
      </LogContext.Provider>,
    );

  const loggedEvents = (): string[] =>
    logEvent.mock.calls.map(([event]) => event.event_name);

  /** The creative's own browsing context, once the bid has rendered. */
  const creativeFrame = (): HTMLIFrameElement => {
    const iframe = screen.getByTestId('ad-slot-2').querySelector('iframe');
    if (!iframe) {
      throw new Error('the creative iframe never rendered');
    }
    return iframe;
  };

  const renderLeaderboard = () => {
    setSlots({ '2': {} });
    return renderWithLog(
      <ReadAdSlot slot={2} format={ReadAdFormat.Leaderboard} eager />,
    );
  };

  beforeEach(() => {
    logEvent.mockClear();
  });

  it('logs the request exactly once with the standardized extras', () => {
    const { rerender } = renderLeaderboard();
    rerender(<ReadAdSlot slot={2} format={ReadAdFormat.Leaderboard} eager />);

    const requests = logEvent.mock.calls.filter(
      ([event]) => event.event_name === LogEvent.RequestAdSlot,
    );
    expect(requests).toHaveLength(1);
    expect(JSON.parse(requests[0][0].extra)).toMatchObject({
      slot: 2,
      format: 'leaderboard',
      surface: 'read',
    });
  });

  it('logs an empty slot when the exchange does not bid', async () => {
    answerWith({ status: 'no_bid' });
    renderLeaderboard();
    await settleAuction();

    expect(loggedEvents()).toContain(LogEvent.EmptyAdSlot);
    expect(loggedEvents()).not.toContain(LogEvent.FillAdSlot);
  });

  it('separates a blocked bundle from a genuine no bid', async () => {
    // Both leave the slot empty, but only one of them is lost revenue.
    answerWith({ status: 'unavailable' });
    renderLeaderboard();
    await settleAuction();

    const empty = logEvent.mock.calls.find(
      ([event]) => event.event_name === LogEvent.EmptyAdSlot,
    );
    expect(JSON.parse(empty[0].extra)).toMatchObject({
      reason: 'unavailable',
    });
  });

  it('logs the winning price at fill, which is what the impression earned', async () => {
    answerWith({ status: 'bid', bid: BID });
    renderLeaderboard();
    await settleAuction();

    const fill = logEvent.mock.calls.find(
      ([event]) => event.event_name === LogEvent.FillAdSlot,
    );
    expect(JSON.parse(fill[0].extra)).toMatchObject({
      slot: 2,
      cpm: 2.5,
      currency: 'USD',
      bidder: 'kueezrtb',
      creative_id: 'creative-1',
      creative_size: '300x250',
    });
  });

  it('reports a render failure apart from an empty auction', async () => {
    answerWith({ status: 'bid', bid: BID });
    mockRenderBid.mockReturnValue(false);
    renderLeaderboard();
    await settleAuction();

    expect(loggedEvents()).toContain(LogEvent.AdSlotError);
    expect(loggedEvents()).not.toContain(LogEvent.FillAdSlot);
    expect(screen.getByTestId('ad-slot-2').parentElement).toHaveClass(
      '!hidden',
    );
  });

  it('logs the loose impression at fill, in the internal ads shape', async () => {
    answerWith({ status: 'bid', bid: BID });
    renderLeaderboard();
    await settleAuction();

    const impressions = logEvent.mock.calls.filter(
      ([event]) => event.event_name === AdActions.Impression,
    );
    expect(impressions).toHaveLength(1);
    expect(impressions[0][0]).toMatchObject({
      target_type: 'ad',
      target_id: 'creative-1',
      ad_provider_id: 'kueez',
    });
    // The strict name is reserved for the MRC measurement from useViewability.
    expect(loggedEvents()).not.toContain(AdActions.Viewable);
  });

  it('logs a click once when focus moves into the filled creative', async () => {
    answerWith({ status: 'bid', bid: BID });
    renderLeaderboard();
    await settleAuction();

    // A click on a creative in its own browsing context never bubbles here;
    // the observable is focus landing on the iframe as the window blurs.
    creativeFrame().focus();
    fireEvent.blur(window);
    fireEvent.blur(window);

    const clicks = logEvent.mock.calls.filter(
      ([event]) =>
        event.event_name === AdActions.Click && event.target_type === 'ad',
    );
    expect(clicks).toHaveLength(1);
    expect(clicks[0][0]).toMatchObject({
      target_id: 'creative-1',
      ad_provider_id: 'kueez',
    });
    expect(JSON.parse(clicks[0][0].extra)).toMatchObject({
      slot: 2,
      surface: 'read',
      signal: 'focus-blur',
    });
  });

  it('logs a same-tab click-through on pagehide', async () => {
    answerWith({ status: 'bid', bid: BID });
    renderLeaderboard();
    await settleAuction();

    creativeFrame().focus();
    fireEvent(window, new Event('pagehide'));

    const clicks = logEvent.mock.calls.filter(
      ([event]) => event.event_name === AdActions.Click,
    );
    expect(clicks).toHaveLength(1);
    expect(JSON.parse(clicks[0][0].extra)).toMatchObject({
      signal: 'pagehide',
    });
  });

  it('disarms a focused creative when the visitor returns without leaving', async () => {
    answerWith({ status: 'bid', bid: BID });
    renderLeaderboard();
    await settleAuction();

    // Tap focuses the creative; the visitor stays, the window regains focus,
    // and only minutes later blurs for an unrelated reason (alt-tab).
    creativeFrame().focus();
    fireEvent.focus(window);
    fireEvent.blur(window);

    expect(loggedEvents()).not.toContain(AdActions.Click);
  });

  it('ignores window blur while focus is outside the creative', async () => {
    answerWith({ status: 'bid', bid: BID });
    renderLeaderboard();
    await settleAuction();

    fireEvent.blur(window);

    expect(loggedEvents()).not.toContain(AdActions.Click);
  });
});
