import React from 'react';
import type { ReactNode } from 'react';
import type { InfiniteData } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { Ad } from '../../graphql/posts';
import { ActiveFeedContext } from '../../contexts/ActiveFeedContext';
import { useFeature } from '../../components/GrowthBookProvider';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useFetchAd } from '../../features/monetization/useFetchAd';
import {
  carryAdRefreshSlot,
  useAdRefresh,
} from '../../features/monetization/refresh/useAdRefresh';
import type { AdRefreshAttempt } from '../../features/monetization/refresh/useAdRefresh';
import {
  AdRefreshOutcome,
  getAdRefreshPolicy,
} from '../../features/monetization/refresh/adRefresh';
import { AdRefreshEngineVersion } from '../../lib/featureManagement';
import { RequestKey } from '../../lib/query';
import { useAutoRotatingAds } from './useAutoRotatingAds';
import { generateAdLogEventKey } from './useLogImpression';
import { useFeedAdRefresh } from './useFeedAdRefresh';

jest.mock('../../components/GrowthBookProvider', () => ({
  ...jest.requireActual('../../components/GrowthBookProvider'),
  useFeature: jest.fn(),
}));
jest.mock('../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));
jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../features/monetization/useFetchAd', () => ({
  useFetchAd: jest.fn(),
}));
jest.mock('../../features/monetization/refresh/useAdRefresh', () => ({
  carryAdRefreshSlot: jest.fn(),
  useAdRefresh: jest.fn(),
}));
jest.mock('./useAutoRotatingAds', () => ({
  useAutoRotatingAds: jest.fn(),
}));

const feedQueryKey = ['feed', 'popular'];
const adsQueryKey = [RequestKey.Ads, ...feedQueryKey];
const createAd = (generationId: string): Ad =>
  ({
    generationId,
    providerId: 'carbon',
    source: 'Carbon',
    description: generationId,
    refresh: {
      id: 'publisher:local@v1',
      intervalSec: 30,
      maxPerSlot: 3,
      maxPerSession: 20,
    },
  }) as Ad;

const ads = [createAd('gen-0'), createAd('gen-1'), createAd('gen-2')];
const replacement = createAd('gen-new');
const legacyRef = jest.fn();
const logEvent = jest.fn();
const logEventEnd = jest.fn();
const fetchAd = jest.fn();
let client: QueryClient;

const renderFeedAdRefresh = (version: AdRefreshEngineVersion) => {
  jest.mocked(useFeature).mockReturnValue(version);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <ActiveFeedContext.Provider value={{ queryKey: feedQueryKey, items: [] }}>
        {children}
      </ActiveFeedContext.Provider>
    </QueryClientProvider>
  );

  return renderHook(() => useFeedAdRefresh(ads[1], 1, 7, jest.fn()), {
    wrapper,
  });
};

const refreshWith = async (): Promise<AdRefreshOutcome> => {
  const { onRefresh } = jest.mocked(useAdRefresh).mock.lastCall?.[0] ?? {};
  const attempt = {
    count: 1,
    sessionCount: 1,
    policy: getAdRefreshPolicy(ads[1].refresh),
    stats: {
      visibleMs: 30_000,
      shownMs: 30_000,
      pauses: {
        hidden: { count: 0, ms: 0 },
        idle: { count: 0, ms: 0 },
        hover: { count: 0, ms: 0 },
      },
    },
  } as AdRefreshAttempt;
  let outcome = AdRefreshOutcome.Failed;

  await act(async () => {
    outcome = (await onRefresh?.(attempt)) ?? AdRefreshOutcome.Failed;
  });

  return outcome;
};

const getCachedAds = () =>
  client.getQueryData<InfiniteData<Ad, unknown>>(adsQueryKey)?.pages;

beforeEach(() => {
  jest.clearAllMocks();
  client = new QueryClient();
  client.setQueryData<InfiniteData<Ad, unknown>>(adsQueryKey, {
    pages: ads,
    pageParams: [0, 1, 2],
  });
  jest.mocked(useAutoRotatingAds).mockReturnValue({
    ref: legacyRef,
    refetch: jest.fn(),
    isRefetching: false,
  });
  jest.mocked(useAdRefresh).mockReturnValue({
    ref: jest.fn(),
    policy: null,
    onAdClick: jest.fn(),
  });
  jest.mocked(useLogContext).mockReturnValue({
    logEvent,
    logEventEnd,
  } as unknown as ReturnType<typeof useLogContext>);
  jest
    .mocked(useAuthContext)
    .mockReturnValue({} as ReturnType<typeof useAuthContext>);
  jest.mocked(useFetchAd).mockReturnValue({ fetchAd, isAdConsentReady: true });
});

describe('useFeedAdRefresh', () => {
  it('keeps the legacy rotation on v1', () => {
    const { result } = renderFeedAdRefresh(AdRefreshEngineVersion.V1);

    expect(result.current.ref).toBe(legacyRef);
    expect(useFetchAd).toHaveBeenCalledWith(false);
    expect(useAdRefresh).toHaveBeenLastCalledWith(
      expect.objectContaining({ disabled: true }),
    );
  });

  it('puts the replacement into its own ad page and ends the old impression', async () => {
    fetchAd.mockResolvedValue(replacement);
    const { result } = renderFeedAdRefresh(AdRefreshEngineVersion.V2);

    expect(result.current.ref).not.toBe(legacyRef);
    expect(await refreshWith()).toEqual(AdRefreshOutcome.Refreshed);
    expect(fetchAd).toHaveBeenCalledWith(
      expect.objectContaining({
        refresh: { count: 1, generationId: 'gen-1' },
      }),
    );
    expect(getCachedAds()).toEqual([ads[0], replacement, ads[2]]);
    expect(carryAdRefreshSlot).toHaveBeenCalledWith('gen-1', 'gen-new');
    expect(logEventEnd).toHaveBeenCalledWith(generateAdLogEventKey(7));
  });

  it('leaves the slot alone when no ad fills', async () => {
    fetchAd.mockResolvedValue(null);
    renderFeedAdRefresh(AdRefreshEngineVersion.V2);

    expect(await refreshWith()).toEqual(AdRefreshOutcome.NoFill);
    expect(getCachedAds()).toEqual(ads);
    expect(logEventEnd).not.toHaveBeenCalled();
  });
});
