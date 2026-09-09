import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import type { AdsenseSlots } from '../../../features/monetization/adsense';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSize } from '../../../hooks/useViewSize';
import { useFeature } from '../../GrowthBookProvider';
import { PHONE_TOP_AD_HEIGHT_VAR, PhoneTopAdStrip } from './PhoneTopAdStrip';
import { ORGANIC_SLOT } from './slots';

jest.mock('../../../hooks/useConditionalFeature');
jest.mock('../../../hooks/useViewSize', () => ({
  ...(jest.requireActual('../../../hooks/useViewSize') as Record<
    string,
    unknown
  >),
  useViewSize: jest.fn(),
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
jest.mock('./slots', () => ({
  ...(jest.requireActual('./slots') as Record<string, unknown>),
  READ_ADSENSE_SLOTS: {},
  ORGANIC_ADSENSE_SLOTS: {},
}));

const mockSlotMaps = jest.requireMock('./slots') as {
  ORGANIC_ADSENSE_SLOTS: AdsenseSlots;
};
const mockUseConditionalFeature = jest.mocked(useConditionalFeature);
const mockUseViewSize = jest.mocked(useViewSize);
const mockUseFeature = jest.mocked(useFeature);

const anonymousAuth = { isAuthReady: true } as unknown as AuthContextData;
const render = (ui: React.ReactElement) =>
  rtlRender(
    <AuthContext.Provider value={anonymousAuth}>{ui}</AuthContext.Provider>,
  );

const setFlag = (value: boolean): void => {
  mockUseConditionalFeature.mockReturnValue({ value, isLoading: false });
};

beforeEach(() => {
  // jsdom has no ResizeObserver; the strip publishes its height through one.
  globalThis.ResizeObserver = class {
    observe = jest.fn();

    disconnect = jest.fn();

    unobserve = jest.fn();
  } as unknown as typeof ResizeObserver;
  mockUseViewSize.mockReturnValue(false);
  mockUseFeature.mockImplementation((feature) => feature.defaultValue);
  mockSlotMaps.ORGANIC_ADSENSE_SLOTS = {
    [ORGANIC_SLOT.topLeaderboardPhone]: { id: '1234567890', type: 'display' },
  };
});

afterEach(() => {
  document.documentElement.style.removeProperty(PHONE_TOP_AD_HEIGHT_VAR);
});

describe('PhoneTopAdStrip', () => {
  it('renders nothing while the flag is off', () => {
    setFlag(false);
    const { container } = render(<PhoneTopAdStrip surface="organic" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('stays out of the way from tablet up, where the in-column twin serves', () => {
    setFlag(true);
    mockUseViewSize.mockReturnValue(true);
    const { container } = render(<PhoneTopAdStrip surface="organic" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('pins the phone unit and publishes its height for the chrome below it', () => {
    setFlag(true);
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
