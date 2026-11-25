import React from 'react';
import type { ReactNode } from 'react';
import type { InfiniteData } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { Ad } from '../../graphql/posts';
import { ActiveFeedContext } from '../../contexts/ActiveFeedContext';
import { useFeature } from '../../components/GrowthBookProvider';
import { useLogContext } from '../../contexts/LogContext';
import { useFetchAd } from '../../features/monetization/useFetchAd';
import { RequestKey } from '../../lib/query';
import type { AdRotationTarget } from '../../features/monetization/refresh/adRefresh';
import { useAutoRotatingAds } from './useAutoRotatingAds';
import { generateAdLogEventKey } from './useLogImpression';

jest.mock('../../components/GrowthBookProvider', () => ({
  ...jest.requireActual('../../components/GrowthBookProvider'),
  useFeature: jest.fn(),
}));
jest.mock('../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));
jest.mock('../../features/monetization/useFetchAd', () => ({
  useFetchAd: jest.fn(),
}));

const feedQueryKey = ['feed', 'my-feed'];
const adsQueryKey = [RequestKey.Ads, ...feedQueryKey];
const createAd = (generationId: string): Ad =>
  ({ generationId, providerId: 'carbon', description: generationId }) as Ad;
const feedAds = [createAd('feed-0'), createAd('feed-1')];
const railAd = createAd('rail-0');
const replacement = createAd('rail-next');
const logEventEnd = jest.fn();
const fetchAd = jest.fn();
let client: QueryClient;

const renderRotation = (target?: AdRotationTarget) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <ActiveFeedContext.Provider value={{ queryKey: feedQueryKey, items: [] }}>
        {children}
      </ActiveFeedContext.Provider>
    </QueryClientProvider>
  );
  return renderHook(
    () => useAutoRotatingAds(railAd, 0, 0, jest.fn(), false, target),
    { wrapper },
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  client = new QueryClient();
  client.setQueryData<InfiniteData<Ad, unknown>>(adsQueryKey, {
    pages: feedAds,
    pageParams: [0, 1],
  });
  // 60 seconds, as autorotate_ads ships
  jest.mocked(useFeature).mockReturnValue(60);
  jest.mocked(useLogContext).mockReturnValue({
    logEventEnd,
  } as unknown as ReturnType<typeof useLogContext>);
  jest.mocked(useFetchAd).mockReturnValue({ fetchAd, isAdConsentReady: true });
  fetchAd.mockResolvedValue(replacement);
});

describe('useAutoRotatingAds', () => {
  it('rotates an ad outside the feed into its own slot, leaving the feed ads alone', async () => {
    const target: AdRotationTarget = {
      queryKey: ['rail-rotation'],
      replace: jest.fn(),
    };
    const { result } = renderRotation(target);

    // What the 60 second timer does while the slot is on screen
    await act(() => result.current.refetch());

    await waitFor(() =>
      expect(target.replace).toHaveBeenCalledWith(replacement),
    );
    expect(
      client.getQueryData<InfiniteData<Ad, unknown>>(adsQueryKey)?.pages,
    ).toEqual(feedAds);
    expect(logEventEnd).not.toHaveBeenCalled();
  });

  it('rotates a feed ad in the feed ad list', async () => {
    const { result } = renderRotation();

    await act(() => result.current.refetch());

    await waitFor(() =>
      expect(
        client.getQueryData<InfiniteData<Ad, unknown>>(adsQueryKey)?.pages,
      ).toEqual([replacement, feedAds[1]]),
    );
    expect(logEventEnd).toHaveBeenCalledWith(generateAdLogEventKey(0));
  });
});
