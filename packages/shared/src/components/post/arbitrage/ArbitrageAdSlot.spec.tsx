import React from 'react';
import {
  act,
  fireEvent,
  render as rtlRender,
  screen,
} from '@testing-library/react';
import {
  ArbitrageAdFormat,
  ArbitrageAdSlot,
  FILL_GRACE_MS,
} from './ArbitrageAdSlot';
import { ArbitrageAnchor } from './ArbitrageAnchor';
import { ArbitrageSidebarAd } from './ArbitrageSidebarAd';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import type { ReadAdsenseSlots } from './adsense';
import { ADSENSE_CLIENT_ID } from './adsense';
import {
  featurePostAdsense,
  featureReadAdsense,
} from '../../../lib/featureManagement';
import { useFeature } from '../../GrowthBookProvider';
import { FLOATING_LEADERBOARD_DELAY_MS, ORGANIC_SLOT } from './slots';

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
  READ_ADSENSE_SLOTS: ReadAdsenseSlots;
  ORGANIC_ADSENSE_SLOTS: ReadAdsenseSlots;
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
const setSlots = (slots: ReadAdsenseSlots): void => {
  mockSlotMaps.READ_ADSENSE_SLOTS = slots;
};

const setOrganicSlots = (slots: ReadAdsenseSlots): void => {
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

  it('reopens a collapsed slot when the creative lands after the grace', async () => {
    jest.useFakeTimers();
    setSlots({ '2': { id: '2222222222', type: 'display' } });
    render(
      <ArbitrageAdSlot slot={2} format={ArbitrageAdFormat.Leaderboard} eager />,
    );

    const ins = screen.getByTestId('adsense-slot-2');
    // The tag stamps this once it has handled the element; without it the
    // slot is still waiting on its request and must not collapse.
    ins.setAttribute('data-adsbygoogle-status', 'done');
    act(() => {
      jest.advanceTimersByTime(FILL_GRACE_MS);
    });
    expect(ins.parentElement).toHaveClass('!hidden');

    // Inside display:none everything measures zero, so the reopen must key on
    // the creative itself — a late fill judged by height stayed hidden forever.
    ins.appendChild(document.createElement('iframe'));
    await act(async () => {
      await Promise.resolve();
    });

    expect(ins.parentElement).not.toHaveClass('!hidden');
    jest.useRealTimers();
  });

  it('keeps a slot the tag has not handled yet out of the collapse', async () => {
    // A slow auction looked identical to a declined ad: the slot collapsed
    // mid-request, and Google will not render into a display:none element.
    jest.useFakeTimers();
    setSlots({ '2': { id: '2222222222', type: 'display' } });
    render(
      <ArbitrageAdSlot slot={2} format={ArbitrageAdFormat.Leaderboard} eager />,
    );

    const ins = screen.getByTestId('adsense-slot-2');
    act(() => {
      jest.advanceTimersByTime(FILL_GRACE_MS);
    });

    expect(ins.parentElement).not.toHaveClass('!hidden');
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
    setSlots({
      '10': { id: '3333333333', type: 'display', width: 300, height: 600 },
    });
    render(
      <ArbitrageAdSlot slot={10} format={ArbitrageAdFormat.HalfPage} eager />,
    );

    const ins = screen.getByTestId('adsense-slot-10');
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
      '13': { id: '', type: 'display' },
    });
    const { container } = render(
      <>
        <ArbitrageAdSlot slot={4} format={ArbitrageAdFormat.MediumRectangle} />
        <ArbitrageAdSlot slot={13} format={ArbitrageAdFormat.Anchor} />
      </>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});

describe('ArbitrageAdSlot on the organic surface', () => {
  const organicFixture: ReadAdsenseSlots = {
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

describe('ArbitrageAnchor', () => {
  // The floating leaderboard is deliberately delayed, so every assertion about
  // it rendering has to run the timer forward first.
  const advancePastDelay = (): void => {
    act(() => {
      jest.advanceTimersByTime(FLOATING_LEADERBOARD_DELAY_MS);
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing while the slot map is empty', () => {
    setSlots({});
    const { container } = render(<ArbitrageAnchor />);
    advancePastDelay();

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the placeholder anchor in development', () => {
    mockConstants.isDevelopment = true;
    setSlots({});
    render(<ArbitrageAnchor />);
    advancePastDelay();

    expect(screen.getByTestId('arbitrage-ad-slot-13')).toBeInTheDocument();
  });

  it('stays unmounted until the delay elapses', () => {
    mockConstants.isDevelopment = true;
    setSlots({});
    const { container } = render(<ArbitrageAnchor />);

    expect(container).toBeEmptyDOMElement();
  });

  it('leaves the viewport bottom free when slot 13 is not configured', () => {
    setSlots({ '2': { id: '2222222222', type: 'display' } });
    const { container } = render(<ArbitrageAnchor />);
    advancePastDelay();

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the floating leaderboard once slot 13 is configured', () => {
    setSlots({ '13': { id: '1313131313', type: 'display' } });
    render(<ArbitrageAnchor />);
    advancePastDelay();

    const ins = screen.getByTestId('adsense-slot-13');
    expect(ins).toHaveAttribute('data-ad-slot', '1313131313');
    expect(ins).toHaveAttribute('data-ad-format', 'horizontal');
  });

  it('holds the dismiss button back until a creative has filled', () => {
    setSlots({ '13': { id: '1313131313', type: 'display' } });
    render(<ArbitrageAnchor />);
    advancePastDelay();

    // jsdom boxes measure zero, which is exactly the unfilled case: a close
    // button with no ad under it would float alone over the page.
    expect(screen.queryByTitle('Close')).not.toBeInTheDocument();
  });

  it('dismisses on close and stays dismissed', () => {
    setSlots({ '13': { id: '1313131313', type: 'display' } });
    const measure = jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ height: 90 } as DOMRect);
    render(<ArbitrageAnchor />);
    advancePastDelay();

    fireEvent.click(screen.getByTitle('Close'));
    measure.mockRestore();

    expect(screen.queryByTestId('adsense-slot-13')).not.toBeInTheDocument();
  });
});

describe('ArbitrageSidebarAd', () => {
  it('keeps the sidebar unit to a rectangle so it cannot serve a half page', () => {
    setSlots({ '1': { id: '1111111111', type: 'display' } });
    render(<ArbitrageSidebarAd />);

    const ins = screen.getByTestId('adsense-slot-1');
    // data-ad-format is only written on the responsive branch: a slot given a
    // fixed size gets an inline width and height instead, and a creative
    // taller than that is clipped by the wrapper's overflow-hidden rather than
    // growing the box.
    expect(ins).toHaveAttribute('data-ad-format', 'rectangle');
    expect(ins).not.toHaveAttribute('style', expect.stringContaining('height'));
  });

  it('frames nothing while the slot has no creative', () => {
    // jsdom boxes measure zero, which is the unfilled case: a bordered band
    // with a dismiss button and no ad under it must not reach the nav.
    setSlots({ '1': { id: '1111111111', type: 'display' } });
    render(<ArbitrageSidebarAd />);

    expect(screen.queryByTitle('Close')).not.toBeInTheDocument();
    // No padding either, or the box leaves an invisible band under the nav.
    const box = screen.getByTestId('adsense-slot-1').closest('div.h-0');
    expect(box).toHaveClass('invisible');
    expect(box?.className).not.toMatch(/\bp[xytb]?-[1-9]/);
  });

  it('clears the unit for the session when closed', async () => {
    setSlots({ '1': { id: '1111111111', type: 'display' } });
    const measure = jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ height: 200 } as DOMRect);
    const { container } = render(<ArbitrageSidebarAd />);

    // A creative landing is what reveals the box and its dismiss button.
    screen
      .getByTestId('adsense-slot-1')
      .appendChild(document.createElement('iframe'));
    await act(async () => {
      await Promise.resolve();
    });
    measure.mockRestore();

    fireEvent.click(screen.getByTitle('Close'));

    expect(container).toBeEmptyDOMElement();
  });
});
