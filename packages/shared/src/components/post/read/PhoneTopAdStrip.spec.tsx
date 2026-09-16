import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import type { AdSlots } from '../../../features/monetization/kueez';
import { useFeature } from '../../GrowthBookProvider';
import { PHONE_TOP_AD_HEIGHT_VAR, PhoneTopAdStrip } from './PhoneTopAdStrip';
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
jest.mock('./slots', () => ({
  ...(jest.requireActual('./slots') as Record<string, unknown>),
  READ_AD_SLOTS: {},
  ORGANIC_AD_SLOTS: {},
}));

// jsdom has no Prebid bundle; the strip only cares that a slot renders.
jest.mock('../../../features/monetization/prebid', () => ({
  configurePrebid: jest.fn(),
  requestKueezBid: jest.fn().mockResolvedValue({ status: 'no_bid' }),
  renderPrebidBid: jest.fn(),
  pingViewable: jest.fn(),
}));

const mockSlotMaps = jest.requireMock('./slots') as {
  ORGANIC_AD_SLOTS: AdSlots;
};
const mockUseFeature = jest.mocked(useFeature);

const anonymousAuth = { isAuthReady: true } as unknown as AuthContextData;
const loggedInAuth = {
  isAuthReady: true,
  user: { id: 'u1' },
} as unknown as AuthContextData;
const render = (ui: React.ReactElement, auth = anonymousAuth) =>
  rtlRender(<AuthContext.Provider value={auth}>{ui}</AuthContext.Provider>);

beforeEach(() => {
  // jsdom has no ResizeObserver; the strip publishes its height through one.
  globalThis.ResizeObserver = class {
    observe = jest.fn();

    disconnect = jest.fn();

    unobserve = jest.fn();
  } as unknown as typeof ResizeObserver;
  mockUseFeature.mockImplementation((feature) => feature.defaultValue);
  mockSlotMaps.ORGANIC_AD_SLOTS = {
    [ORGANIC_SLOT.topLeaderboardPhone]: { sizes: [[320, 50]] },
  };
});

afterEach(() => {
  document.documentElement.style.removeProperty(PHONE_TOP_AD_HEIGHT_VAR);
});

describe('PhoneTopAdStrip', () => {
  it('renders nothing for logged-in users, like every other unit', () => {
    const { container } = render(
      <PhoneTopAdStrip surface="organic" />,
      loggedInAuth,
    );

    expect(container).toBeEmptyDOMElement();
    expect(
      document.documentElement.style.getPropertyValue(PHONE_TOP_AD_HEIGHT_VAR),
    ).toBe('');
  });

  it('pins the phone unit and publishes its height for the chrome below it', () => {
    const { unmount } = render(<PhoneTopAdStrip surface="organic" />);

    expect(screen.getByTestId('phone-top-ad-strip')).toBeInTheDocument();
    expect(
      document.documentElement.style.getPropertyValue(PHONE_TOP_AD_HEIGHT_VAR),
    ).toBe('0px');

    unmount();

    expect(
      document.documentElement.style.getPropertyValue(PHONE_TOP_AD_HEIGHT_VAR),
    ).toBe('');
  });
});
