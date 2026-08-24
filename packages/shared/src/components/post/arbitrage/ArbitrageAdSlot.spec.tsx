import React from 'react';
import { act, render as rtlRender, screen } from '@testing-library/react';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import { getLogContextStatic } from '../../../contexts/LogContext';
import type { LogContextData } from '../../../hooks/log/useLogContextData';
import { LogEvent } from '../../../lib/log';
import type { AdsenseSlots } from '../../../features/monetization/adsense';
import { ADSENSE_CLIENT_ID } from '../../../features/monetization/adsense';
import {
  featurePostAdsense,
  featureReadAdsense,
} from '../../../lib/featureManagement';
import { useFeature } from '../../GrowthBookProvider';
import { ORGANIC_SLOT } from './slots';

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

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

// The slot maps ship hardcoded; tests swap in fixtures via these mutable
// module objects rather than asserting against production unit ids.
jest.mock('./slots', () => ({
  ...(jest.requireActual('./slots') as Record<string, unknown>),
  READ_ADSENSE_SLOTS: {},
  ORGANIC_ADSENSE_SLOTS: {},
}));

const mockConstants = jest.requireMock('../../../lib/constants') as {
  isDevelopment: boolean;
};
const mockSlotMaps = jest.requireMock('./slots') as {
  READ_ADSENSE_SLOTS: AdsenseSlots;
  ORGANIC_ADSENSE_SLOTS: AdsenseSlots;
};

const mockUseConditionalFeature = jest.mocked(useConditionalFeature);
const mockUseFeature = jest.mocked(useFeature);

const flags = { organic: false, read: true };

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

/** Fills the /read map — the surface has no flag, the map alone decides. */
const setSlots = (slots: AdsenseSlots): void => {
  mockSlotMaps.READ_ADSENSE_SLOTS = slots;
};

const setOrganicSlots = (slots: AdsenseSlots): void => {
  flags.organic = Object.keys(slots).length > 0;
  mockSlotMaps.ORGANIC_ADSENSE_SLOTS = slots;
};

beforeEach(() => {
  mockConstants.isDevelopment = false;
  flags.organic = false;
  flags.read = true;
  mockSlotMaps.READ_ADSENSE_SLOTS = {};
  mockSlotMaps.ORGANIC_ADSENSE_SLOTS = {};
  mockUseFeature.mockImplementation((feature) =>
    feature === featureReadAdsense ? flags.read : feature.defaultValue,
  );
  mockUseConditionalFeature.mockImplementation(
    ({ feature, shouldEvaluate }) => {
      if (feature === featurePostAdsense && shouldEvaluate) {
        return { value: flags.organic, isLoading: false };
      }
      return { value: feature.defaultValue, isLoading: false };
    },
  );
});

describe('ArbitrageAdSlot', () => {
  it('renders nothing while the slot map is empty', () => {
    setSlots({});
    const { container } = render(
      <ArbitrageAdSlot slot={3} format={ArbitrageAdFormat.Rectangle} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the density-review placeholder only in development', () => {
    mockConstants.isDevelopment = true;
    setSlots({});
    render(<ArbitrageAdSlot slot={3} format={ArbitrageAdFormat.Rectangle} />);

    expect(screen.getByTestId('arbitrage-ad-slot-3')).toBeInTheDocument();
    expect(screen.queryByTestId('adsense-slot-3')).not.toBeInTheDocument();
  });

  it('restricts a responsive unit to its format shape', () => {
    setSlots({ '3': { id: '1234567890', type: 'display' } });
    render(
      <ArbitrageAdSlot
        slot={3}
        format={ArbitrageAdFormat.MediumRectangle}
        eager
      />,
    );

    // Left on `auto`, a 300px-wide slot is free to answer with a 300x600.
    const ins = screen.getByTestId('adsense-slot-3');
    expect(ins).toHaveAttribute('data-ad-format', 'rectangle');
    expect(ins).not.toHaveAttribute('data-full-width-responsive');
  });

  it('keeps banners horizontal so a rectangle cannot fill them', () => {
    setSlots({ '2': { id: '1234567890', type: 'display' } });
    render(
      <ArbitrageAdSlot slot={2} format={ArbitrageAdFormat.Leaderboard} eager />,
    );

    expect(screen.getByTestId('adsense-slot-2')).toHaveAttribute(
      'data-ad-format',
      'horizontal',
    );
  });

  it('drops phone-hidden slots below the tablet breakpoint', () => {
    setSlots({ '5': { id: '1234567890', type: 'inArticle' } });
    render(
      <ArbitrageAdSlot
        slot={5}
        format={ArbitrageAdFormat.Rectangle}
        hideOnPhone
        eager
      />,
    );

    expect(screen.getByTestId('adsense-slot-5').parentElement).toHaveClass(
      'hidden',
      'tablet:block',
    );
  });

  it('renders a live in-article unit when the slot is configured', () => {
    setSlots({ '3': { id: '1234567890', type: 'inArticle' } });
    render(
      <ArbitrageAdSlot slot={3} format={ArbitrageAdFormat.Rectangle} eager />,
    );

    const ins = screen.getByTestId('adsense-slot-3');
    expect(ins).toHaveClass('adsbygoogle');
    expect(ins).toHaveAttribute('data-ad-client', ADSENSE_CLIENT_ID);
    expect(ins).toHaveAttribute('data-ad-slot', '1234567890');
    expect(ins).toHaveAttribute('data-ad-layout', 'in-article');
    expect(ins).toHaveAttribute('data-ad-format', 'fluid');
    expect(screen.queryByTestId('arbitrage-ad-slot-3')).not.toBeInTheDocument();
  });

  it('never hides a slot AdSense has not declined', async () => {
    // Height and a missing iframe cannot tell a slow auction from a declined
    // ad, and hiding is unrecoverable: display:none is not something Google
    // renders into, so a slot hidden while waiting never fills at all. Only
    // data-ad-status="unfilled" means no ad, and the wrapper's CSS rule
    // handles that one.
    jest.useFakeTimers();
    setSlots({ '2': { id: '2222222222', type: 'display' } });
    render(
      <ArbitrageAdSlot slot={2} format={ArbitrageAdFormat.Leaderboard} eager />,
    );

    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });

    expect(screen.getByTestId('adsense-slot-2').parentElement).not.toHaveClass(
      '!hidden',
    );
    jest.useRealTimers();
  });

  it('mounts no <ins> before the slot becomes eligible', () => {
    // adsbygoogle.push({}) binds to the first uninitialised ins in document
    // order, not to the slot that pushed — so an ins that is not meant to be
    // requested yet must not exist at all. The suite-wide IntersectionObserver
    // mock never fires, which models exactly that state.
    setSlots({ '3': { id: '1234567890', type: 'display' } });
    render(<ArbitrageAdSlot slot={3} format={ArbitrageAdFormat.Rectangle} />);

    expect(screen.queryByTestId('adsense-slot-3')).not.toBeInTheDocument();
  });

  it('requests eager slots on mount without waiting for intersection', () => {
    // The suite-wide IntersectionObserver mock never fires callbacks, so a
    // push proves the eager path skipped the observer entirely.
    window.adsbygoogle = [];
    setSlots({ '2': { id: '2222222222', type: 'display' } });
    render(
      <ArbitrageAdSlot slot={2} format={ArbitrageAdFormat.Leaderboard} eager />,
    );

    expect(window.adsbygoogle).toHaveLength(1);
  });

  it('serves test creatives on any host but production', () => {
    setSlots({ '2': { id: '2222222222', type: 'display' } });
    render(
      <ArbitrageAdSlot slot={2} format={ArbitrageAdFormat.Leaderboard} eager />,
    );

    expect(screen.getByTestId('adsense-slot-2')).toHaveAttribute(
      'data-adtest',
      'on',
    );
  });

  it('renders fixed-size units at exactly the configured size', () => {
    setOrganicSlots({
      [ORGANIC_SLOT.railHalfPage]: {
        id: '3333333333',
        type: 'display',
        width: 300,
        height: 600,
      },
    });
    render(
      <ArbitrageAdSlot
        surface="organic"
        slot={ORGANIC_SLOT.railHalfPage}
        format={ArbitrageAdFormat.HalfPage}
        eager
      />,
    );

    const ins = screen.getByTestId(`adsense-slot-${ORGANIC_SLOT.railHalfPage}`);
    expect(ins).toHaveStyle({ width: '300px', height: '600px' });
    expect(ins).not.toHaveAttribute('data-ad-format');
  });

  it('never renders for logged-in users', () => {
    setSlots({ '3': { id: '1234567890', type: 'inArticle' } });
    const { container } = renderLoggedIn(
      <ArbitrageAdSlot slot={3} format={ArbitrageAdFormat.Rectangle} eager />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('stays dark until auth resolves, so a logged-in boot never sees a flash', () => {
    setSlots({ '3': { id: '1234567890', type: 'inArticle' } });
    const { container } = rtlRender(
      <AuthContext.Provider
        value={{ isAuthReady: false } as unknown as AuthContextData}
      >
        <ArbitrageAdSlot slot={3} format={ArbitrageAdFormat.Rectangle} eager />
      </AuthContext.Provider>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('goes dark when the read_adsense kill switch is off', () => {
    flags.read = false;
    setSlots({ '3': { id: '1234567890', type: 'inArticle' } });
    const { container } = render(
      <ArbitrageAdSlot slot={3} format={ArbitrageAdFormat.Rectangle} eager />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('collapses unconfigured and empty-id slots in live mode', () => {
    setSlots({
      '3': { id: '1234567890', type: 'inArticle' },
      '12': { id: '', type: 'display' },
    });
    const { container } = render(
      <>
        <ArbitrageAdSlot slot={4} format={ArbitrageAdFormat.MediumRectangle} />
        <ArbitrageAdSlot slot={12} format={ArbitrageAdFormat.MediumRectangle} />
      </>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});

describe('ArbitrageAdSlot on the organic surface', () => {
  const organicFixture: AdsenseSlots = {
    [ORGANIC_SLOT.topLeaderboard]: { id: '5555555555', type: 'display' },
  };

  it('renders when post_adsense is on for a non-Plus user', () => {
    setOrganicSlots(organicFixture);
    render(
      <ArbitrageAdSlot
        surface="organic"
        slot={ORGANIC_SLOT.topLeaderboard}
        format={ArbitrageAdFormat.Leaderboard}
        eager
      />,
    );

    expect(
      screen.getByTestId(`adsense-slot-${ORGANIC_SLOT.topLeaderboard}`),
    ).toHaveAttribute('data-ad-slot', '5555555555');
  });

  it('never renders for logged-in users', () => {
    setOrganicSlots(organicFixture);
    const { container } = renderLoggedIn(
      <ArbitrageAdSlot
        surface="organic"
        slot={ORGANIC_SLOT.topLeaderboard}
        format={ArbitrageAdFormat.Leaderboard}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('ignores the read flag and map entirely', () => {
    setSlots({
      [ORGANIC_SLOT.topLeaderboard]: { id: '9999999999', type: 'display' },
    });
    const { container } = render(
      <ArbitrageAdSlot
        surface="organic"
        slot={ORGANIC_SLOT.topLeaderboard}
        format={ArbitrageAdFormat.Leaderboard}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('never enrolls into post_adsense while no unit has an id', () => {
    // Enrollment with nothing renderable fills the experiment with users for
    // whom variant and control are byte-identical.
    mockSlotMaps.ORGANIC_ADSENSE_SLOTS = {
      [ORGANIC_SLOT.topLeaderboard]: { id: '', type: 'display' },
    };
    flags.organic = true;
    const { container } = render(
      <ArbitrageAdSlot
        surface="organic"
        slot={ORGANIC_SLOT.topLeaderboard}
        format={ArbitrageAdFormat.Leaderboard}
        eager
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(mockUseConditionalFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
  });

  it('shows no development placeholder outside the read template', () => {
    mockConstants.isDevelopment = true;
    setOrganicSlots({});
    const { container } = render(
      <ArbitrageAdSlot
        surface="organic"
        slot={ORGANIC_SLOT.topLeaderboard}
        format={ArbitrageAdFormat.Leaderboard}
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

  beforeEach(() => {
    logEvent.mockClear();
  });

  it('logs the request exactly once with the standardized extras', () => {
    setSlots({ '2': { id: '2222222222', type: 'display' } });
    const { rerender } = renderWithLog(
      <ArbitrageAdSlot slot={2} format={ArbitrageAdFormat.Leaderboard} eager />,
    );
    rerender(
      <ArbitrageAdSlot slot={2} format={ArbitrageAdFormat.Leaderboard} eager />,
    );

    const requests = logEvent.mock.calls.filter(
      ([event]) => event.event_name === LogEvent.RequestAdsenseSlot,
    );
    expect(requests).toHaveLength(1);
    expect(JSON.parse(requests[0][0].extra)).toMatchObject({
      slot: 2,
      unit: '2222222222',
      unit_type: 'display',
      format: 'leaderboard',
      surface: 'read',
    });
  });

  it('logs an empty slot when AdSense answers unfilled', async () => {
    setSlots({ '2': { id: '2222222222', type: 'display' } });
    renderWithLog(
      <ArbitrageAdSlot slot={2} format={ArbitrageAdFormat.Leaderboard} eager />,
    );

    screen
      .getByTestId('adsense-slot-2')
      .setAttribute('data-ad-status', 'unfilled');
    await act(async () => {
      await Promise.resolve();
    });

    expect(loggedEvents()).toContain(LogEvent.EmptyAdsenseSlot);
    expect(loggedEvents()).not.toContain(LogEvent.FillAdsenseSlot);
  });

  it('logs a fill when the creative iframe lands', async () => {
    setSlots({ '2': { id: '2222222222', type: 'display' } });
    renderWithLog(
      <ArbitrageAdSlot slot={2} format={ArbitrageAdFormat.Leaderboard} eager />,
    );

    screen
      .getByTestId('adsense-slot-2')
      .appendChild(document.createElement('iframe'));
    await act(async () => {
      await Promise.resolve();
    });

    expect(loggedEvents()).toContain(LogEvent.FillAdsenseSlot);
  });

  it('logs a push error when adsbygoogle rejects the request', () => {
    // Simulates the tag being present but broken (partial ad-block).
    window.adsbygoogle = {
      push: () => {
        throw new Error('adsbygoogle push blocked');
      },
    } as unknown as typeof window.adsbygoogle;
    setSlots({ '2': { id: '2222222222', type: 'display' } });
    renderWithLog(
      <ArbitrageAdSlot slot={2} format={ArbitrageAdFormat.Leaderboard} eager />,
    );
    window.adsbygoogle = [];

    expect(loggedEvents()).toContain(LogEvent.AdsenseSlotError);
  });
});
