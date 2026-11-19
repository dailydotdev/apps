import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';
import { ReadAdFormat, ReadAdSlot } from './ReadAdSlot';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import {
  featureOrganicAds,
  featureReadAds,
} from '../../../lib/featureManagement';
import { useFeature } from '../../GrowthBookProvider';
import type { AdSlots } from './slots';
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

const flags = { read: true, organic: true };

// Both surfaces are anonymous-only and wait for boot, so the default render
// is an anonymous visitor with auth resolved.
const anonymousAuth = { isAuthReady: true } as unknown as AuthContextData;
const render = (ui: React.ReactElement): ReturnType<typeof rtlRender> =>
  rtlRender(
    <AuthContext.Provider value={anonymousAuth}>{ui}</AuthContext.Provider>,
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
  flags.organic = true;
  mockSlotMaps.READ_AD_SLOTS = {};
  mockSlotMaps.ORGANIC_AD_SLOTS = {};
  mockUseFeature.mockImplementation((feature) => {
    if (feature === featureReadAds) {
      return flags.read;
    }

    return feature === featureOrganicAds ? flags.organic : feature.defaultValue;
  });
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
    expect(screen.queryByTestId('ad-slot-3')).not.toBeInTheDocument();
  });

  it('renders an empty anchor with the id the partner configs target', () => {
    setSlots({ '3': true });
    render(<ReadAdSlot slot={3} format={ReadAdFormat.Rectangle} />);

    const anchor = screen.getByTestId('ad-slot-3');
    // the tag fills it by selector; until then it takes no room at all
    expect(anchor).toBeEmptyDOMElement();
    expect(anchor).toHaveAttribute('data-ad-slot', 'read-3');
    expect(anchor).toHaveAttribute('data-ad-format', ReadAdFormat.Rectangle);
    expect(anchor).toHaveClass('empty:!hidden');
  });

  it('drops phone-hidden slots below the tablet breakpoint', () => {
    setSlots({ '5': true });
    render(<ReadAdSlot slot={5} format={ReadAdFormat.Rectangle} hideOnPhone />);

    expect(screen.getByTestId('ad-slot-5')).toHaveClass(
      'hidden',
      'tablet:flex',
    );
  });

  it('never renders for logged-in users', () => {
    setSlots({ '3': true });
    const { container } = renderLoggedIn(
      <ReadAdSlot slot={3} format={ReadAdFormat.Rectangle} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('stays dark until auth resolves, so a logged-in boot never sees a flash', () => {
    setSlots({ '3': true });
    const { container } = rtlRender(
      <AuthContext.Provider
        value={{ isAuthReady: false } as unknown as AuthContextData}
      >
        <ReadAdSlot slot={3} format={ReadAdFormat.Rectangle} />
      </AuthContext.Provider>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('goes dark when the read_ads kill switch is off', () => {
    flags.read = false;
    setSlots({ '3': true });
    const { container } = render(
      <ReadAdSlot slot={3} format={ReadAdFormat.Rectangle} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('collapses slot numbers the surface does not carry', () => {
    setSlots({ '3': true });
    const { container } = render(
      <ReadAdSlot slot={4} format={ReadAdFormat.MediumRectangle} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});

describe('ReadAdSlot on the organic surface', () => {
  const organicFixture: AdSlots = {
    [ORGANIC_SLOT.topLeaderboard]: true,
  };

  it('renders an anchor named after its own surface', () => {
    setOrganicSlots(organicFixture);
    render(
      <ReadAdSlot
        surface="organic"
        slot={ORGANIC_SLOT.topLeaderboard}
        format={ReadAdFormat.Leaderboard}
      />,
    );

    expect(
      screen.getByTestId(`ad-slot-${ORGANIC_SLOT.topLeaderboard}`),
    ).toHaveAttribute('data-ad-slot', `organic-${ORGANIC_SLOT.topLeaderboard}`);
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

  it('goes dark when the organic_ads kill switch is off', () => {
    flags.organic = false;
    setOrganicSlots(organicFixture);
    const { container } = render(
      <ReadAdSlot
        surface="organic"
        slot={ORGANIC_SLOT.topLeaderboard}
        format={ReadAdFormat.Leaderboard}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('ignores the read flag and map entirely', () => {
    setSlots({ [ORGANIC_SLOT.topLeaderboard]: true });
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
