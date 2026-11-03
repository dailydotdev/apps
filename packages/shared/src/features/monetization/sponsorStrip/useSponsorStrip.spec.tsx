import React from 'react';
import { renderHook } from '@testing-library/react';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import { getLogContextStatic } from '../../../contexts/LogContext';
import type { LogContextData } from '../../../hooks/log/useLogContextData';
import { SharedFeedPage } from '../../../components/utilities/common';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSizeClient } from '../../../hooks/useViewSize';
import { featureForceAd } from '../../../lib/featureManagement';
import { useSponsorStrip } from './useSponsorStrip';

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('../../../hooks/useViewSize', () => ({
  ...(jest.requireActual('../../../hooks/useViewSize') as Record<
    string,
    unknown
  >),
  useViewSizeClient: jest.fn(),
}));

const mockFeature = jest.mocked(useConditionalFeature);
const mockViewSize = jest.mocked(useViewSizeClient);

const LogContext = getLogContextStatic();

const mockFlags = ({ forceAd = false }: { forceAd?: boolean } = {}) =>
  mockFeature.mockImplementation(({ feature }) => ({
    value: feature.id === featureForceAd.id ? forceAd : true,
    isLoading: false,
  }));

const render = ({
  feedName = SharedFeedPage.MyFeed as string,
  disableAds = false,
  suppressed = false,
  isPlus = false,
}: {
  feedName?: string;
  disableAds?: boolean;
  suppressed?: boolean;
  isPlus?: boolean;
} = {}) =>
  renderHook(() => useSponsorStrip({ feedName, disableAds, suppressed }), {
    wrapper: ({ children }) => (
      <AuthContext.Provider
        value={
          {
            isAuthReady: true,
            user: { id: 'u1', isPlus },
          } as unknown as AuthContextData
        }
      >
        <LogContext.Provider
          value={{ logEvent: jest.fn() } as unknown as LogContextData}
        >
          {children}
        </LogContext.Provider>
      </AuthContext.Provider>
    ),
  });

beforeEach(() => {
  jest.clearAllMocks();
  mockFlags();
  mockViewSize.mockReturnValue(true);
});

it('should not evaluate the flag while another surface may take the bottom edge', () => {
  expect(render({ suppressed: true }).result.current).toBe(false);
  expect(mockFeature).toHaveBeenCalledWith(
    expect.objectContaining({ shouldEvaluate: false }),
  );
});

it('should be on for a feed that can show the Happening Now card', () => {
  expect(render().result.current).toBe(true);
});

it('should be off when the experiment is off', () => {
  mockFeature.mockReturnValue({ value: false, isLoading: false });

  expect(render().result.current).toBe(false);
});

it('should be off for a Plus subscriber, who paid for no ads', () => {
  expect(render({ isPlus: true }).result.current).toBe(false);
});

it('should be on for a Plus subscriber when force_ad is on', () => {
  mockFlags({ forceAd: true });

  expect(render({ isPlus: true }).result.current).toBe(true);
});

it('should be off on a feed with ads switched off', () => {
  expect(render({ disableAds: true }).result.current).toBe(false);
});

it('should be off below tablet, where a logo wall costs more feed than it holds logos', () => {
  mockViewSize.mockReturnValue(false);

  expect(render().result.current).toBe(false);
});

it('should be off on a feed that never shows the card', () => {
  expect(render({ feedName: SharedFeedPage.Search }).result.current).toBe(
    false,
  );
  expect(render({ feedName: 'squad' }).result.current).toBe(false);
});
it('should not evaluate the experiment for anyone who could not see it', () => {
  render({ isPlus: true });

  expect(mockFeature).toHaveBeenCalledWith(
    expect.objectContaining({ shouldEvaluate: false }),
  );
});
